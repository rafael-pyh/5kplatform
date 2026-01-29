import 'reflect-metadata';
import sequelize from '../database/sequelize';
import { CreditTransaction } from '../models/CreditTransaction';
import { Lead } from '../models/Lead';
import { Op } from 'sequelize';

/**
 * Script para associar transações de comissão existentes aos leads
 * Baseado na description que contém "Lead convertido: {nome}"
 */
async function associateExistingCommissions() {
  try {
    // Conectar ao banco
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco de dados");

    // Primeiro, vamos ver quantas transações existem
    const totalTransactions = await CreditTransaction.count();
    console.log(`Total de transações: ${totalTransactions}`);

    const commissionTransactions = await CreditTransaction.count({
      where: { type: 'COMMISSION' }
    });
    console.log(`Transações de COMMISSION: ${commissionTransactions}`);

    const boughtLeads = await Lead.count({
      where: { status: 'BOUGHT' }
    });
    console.log(`Leads com status BOUGHT: ${boughtLeads}`);

    // Ver detalhes da transação de COMMISSION
    const commissionTx = await CreditTransaction.findOne({
      where: { type: 'COMMISSION' }
    });

    if (commissionTx) {
      console.log(`Transação COMMISSION:`, {
        id: commissionTx.id,
        amount: commissionTx.amount,
        leadId: commissionTx.leadId,
        description: commissionTx.description
      });

      if (commissionTx.leadId) {
        const lead = await Lead.findByPk(commissionTx.leadId);
        if (lead) {
          console.log(`Lead associado: ${lead.name}, status: ${lead.status}`);
        }
      }
    }

    // Buscar transações de COMMISSION que não têm leadId
    const transactions = await CreditTransaction.findAll({
      where: {
        type: 'COMMISSION',
        leadId: null,
        description: {
          [Op.like]: 'Lead convertido: %'
        }
      }
    });

    console.log(`Encontradas ${transactions.length} transações para atualizar`);

    for (const transaction of transactions) {
      // Extrair o nome do lead da description
      const match = transaction.description?.match(/Lead convertido: (.+)/);
      if (!match) {
        console.log(`❌ Description inválida para transação ${transaction.id}: ${transaction.description}`);
        continue;
      }

      const leadName = match[1];
      console.log(`🔍 Procurando lead: "${leadName}"`);

      // Buscar o lead pelo nome e ownerId (da transação)
      const lead = await Lead.findOne({
        where: {
          name: leadName,
          ownerId: transaction.personId
        }
      });

      if (!lead) {
        console.log(`❌ Lead não encontrado para transação ${transaction.id}: "${leadName}"`);
        continue;
      }

      // Atualizar a transação com o leadId
      await transaction.update({ leadId: lead.id });
      console.log(`✅ Transação ${transaction.id} associada ao lead ${lead.id} (${lead.name})`);
    }

    console.log('✅ Processo concluído!');
  } catch (error) {
    console.error('❌ Erro ao associar transações:', error);
  }
}

// Função para testar o query
async function testCommissionQuery() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco de dados");

    // Testar SQL diretamente
    const [results] = await sequelize.query(`
      SELECT l.id, l.name, l.status,
             COALESCE(ct.total_commission, 0) as commissionAmount
      FROM "Lead" l
      LEFT JOIN (
        SELECT "leadId", SUM(amount) as total_commission
        FROM "CreditTransaction"
        WHERE type = 'COMMISSION'
        GROUP BY "leadId"
      ) ct ON l.id = ct."leadId"
      WHERE l.status = 'BOUGHT'
      LIMIT 5
    `);

    console.log('Resultados SQL direto:');
    (results as any[]).forEach(row => {
      console.log(`- ${row.name}: R$ ${row.commissionamount}`);
    });

    // Testar com literal
    const leadsWithCommission = await Lead.findAll({
      where: { status: 'BOUGHT' },
      attributes: [
        'id', 'name', 'status',
        [
          sequelize.literal(`COALESCE((
            SELECT SUM(amount)
            FROM "CreditTransaction"
            WHERE "CreditTransaction"."leadId" = "Lead"."id"
            AND "CreditTransaction"."type" = 'COMMISSION'
          ), 0)`),
          'commissionAmount'
        ]
      ],
      limit: 5
    });

    console.log('Leads com literal:');
    leadsWithCommission.forEach(lead => {
      console.log(`- ${lead.name}: R$ ${(lead as any).commissionAmount}`);
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // testCommissionQuery()
  associateExistingCommissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Exportar funções para uso externo
export { associateExistingCommissions, testCommissionQuery };