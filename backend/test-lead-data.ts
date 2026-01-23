import { Lead } from './src/models/Lead';
import * as dotenv from 'dotenv';

dotenv.config();

async function testLeadData() {
  try {
    console.log('Buscando o lead mais recente...');
    const lead = await Lead.findOne({
      order: [['createdAt', 'DESC']],
      include: [{
        model: 'Person',
        as: 'owner',
      }],
    });

    if (!lead) {
      console.log('Nenhum lead encontrado');
      process.exit(0);
    }

    console.log('\n=== Lead Object ===');
    console.log(lead.toJSON());

    console.log('\n=== Field Values ===');
    console.log('ID:', lead.id);
    console.log('Name:', lead.name);
    console.log('City:', lead.city);
    console.log('State:', lead.state);
    console.log('energyBill:', lead.energyBill ? lead.energyBill.substring(0, 100) + '...' : 'undefined');
    console.log('roofPhoto:', lead.roofPhoto ? lead.roofPhoto.substring(0, 100) + '...' : 'undefined');

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

testLeadData();
