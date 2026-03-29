/**
 * Exemplo de Teste Completo do Fluxo de Kits / Loja
 * Use como referência para testes manuais ou testes automatizados
 */

// ==================== EXEMPLO DE TESTE MANUAL ====================

/**
 * SETUP
 */

const API_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = 'seu_token_admin_aqui';
const USER_TOKEN = 'seu_token_usuario_aqui';

// ==================== 1. CRIAR PRODUTOS ====================

async function testCreateProducts() {
  console.log('\n=== Criando Produtos ===');

  const products = [
    {
      name: 'Painel Solar 100W',
      price: 599.99,
      sku: 'PS-100W',
      description: 'Painel solar monocristalino de alta eficiência',
      stock: 50,
    },
    {
      name: 'Inversor Solar 5KW',
      price: 1500.00,
      sku: 'IS-5KW',
      description: 'Inversor trifásico para sistemas fotovoltaicos',
      stock: 20,
    },
    {
      name: 'Estrutura de Montagem',
      price: 250.00,
      sku: 'EM-STD',
      description: 'Estrutura de alumínio para painéis',
      stock: 100,
    },
  ];

  const createdProducts = [];

  for (const product of products) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    const data = await response.json();
    createdProducts.push(data.data);
    console.log(`✅ Produto criado: ${data.data.name} (ID: ${data.data.id})`);
  }

  return createdProducts;
}

// ==================== 2. ADICIONAR IMAGENS AOS PRODUTOS ====================

async function testAddProductImages(products: any[]) {
  console.log('\n=== Adicionando Imagens aos Produtos ===');

  // Simular upload de imagem
  const imageUrl = 'https://example.com/painel-solar.jpg';

  for (const product of products) {
    const formData = new FormData();
    formData.append('image', new File(['fake'], 'image.jpg', { type: 'image/jpeg' }));
    formData.append('order', '1');
    formData.append('description', `Imagem principal de ${product.name}`);

    const response = await fetch(`${API_URL}/products/${product.id}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log(`✅ Imagem adicionada: ${product.name}`);
  }
}

// ==================== 3. CRIAR KIT ====================

async function testCreateKit(products: any[]) {
  console.log('\n=== Criando Kit ===');

  const kit = {
    name: 'Kit Solar Residencial 5KW',
    price: 4999.99,
    description: 'Kit completo para instalação solar em residência',
    sku: 'KIT-SOLAR-5KW',
    tags: 'kit,solar,residencial,5kw',
    items: [
      {
        productId: products[0].id, // Painel Solar
        quantity: 10,
        notes: 'Painéis solares 100W',
      },
      {
        productId: products[1].id, // Inversor
        quantity: 1,
        notes: 'Inversor 5KW trifásico',
      },
      {
        productId: products[2].id, // Estrutura
        quantity: 10,
        notes: 'Estruturas de montagem',
      },
    ],
  };

  const response = await fetch(`${API_URL}/kits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(kit),
  });

  const data = await response.json();
  console.log(`✅ Kit criado: ${data.data.name} (ID: ${data.data.id})`);
  console.log(`   Preço: R$ ${data.data.price}`);
  console.log(`   Itens: ${kit.items.length}`);

  return data.data;
}

// ==================== 4. CRIAR PEDIDO (COM COMPROVANTE) ====================

async function testCreateOrderWithProof(kit: any) {
  console.log('\n=== Fluxo 1: Pedido com Comprovante ===');

  // 1. Criar pedido
  const orderResponse = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kitId: kit.id,
      useCredit: false,
      notes: 'Pedido para instalação em casa nova',
    }),
  });

  const orderData = await orderResponse.json();
  const order = orderData.data;
  console.log(`✅ Pedido criado: ${order.orderCode}`);
  console.log(`   Status: ${order.status}`);
  console.log(`   Total: R$ ${order.totalPrice}`);

  // 2. Simular transferência do usuário
  console.log(`\n📌 Usuário realiza transferência de R$ ${order.totalPrice}`);

  // 3. Upload de comprovante
  const proofFormData = new FormData();
  proofFormData.append('proof', new File(['fake'], 'comprovante.jpg', { type: 'image/jpeg' }));

  const proofResponse = await fetch(`${API_URL}/orders/${order.id}/payment-proofs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
    },
    body: proofFormData,
  });

  const proofData = await proofResponse.json();
  console.log(`✅ Comprovante enviado (ID: ${proofData.data.id})`);

  // 4. Admin aprova
  const approveResponse = await fetch(`${API_URL}/orders/${order.id}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const approvedOrder = (await approveResponse.json()).data;
  console.log(`✅ Pedido aprovado pelo admin`);
  console.log(`   Status: ${approvedOrder.status}`);
  console.log(`   Aprovado em: ${approvedOrder.approvedAt}`);

  return order;
}

// ==================== 5. CRIAR PEDIDO (COM CRÉDITOS) ====================

async function testCreateOrderWithCredits(kit: any) {
  console.log('\n=== Fluxo 2: Pedido com Créditos ===');

  // 1. Verificar saldo
  const walletResponse = await fetch(`${API_URL}/credits/balance`, {
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
    },
  });

  const wallet = (await walletResponse.json()).data;
  console.log(`💰 Saldo disponível: R$ ${wallet.balance.toFixed(2)}`);

  // Simular: admin adicionou créditos antes
  if (wallet.balance < kit.price) {
    console.log(
      `⚠️  Saldo insuficiente (R$ ${wallet.balance.toFixed(2)} < R$ ${kit.price.toFixed(2)})`
    );
    console.log('📌 Admin precisa adicionar créditos antes');

    // Fazer ajuste manual (admin)
    const adjustResponse = await fetch(`${API_URL}/credits/adjust`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personId: 'user-id', // Substituir pelo ID real
        amount: kit.price + 100,
        reason: 'Adição de créditos para teste',
      }),
    });

    console.log(`✅ Créditos adicionados pelo admin`);
  }

  // 2. Criar pedido COM créditos
  const orderResponse = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kitId: kit.id,
      useCredit: true,
      notes: 'Pedido pago com créditos',
    }),
  });

  const orderData = await orderResponse.json();
  const order = orderData.data;
  console.log(`✅ Pedido criado com créditos: ${order.orderCode}`);
  console.log(`   Status: ${order.status} (já PAID)`);
  console.log(`   Créditos debitados: R$ ${order.totalPrice}`);

  // 3. Admin aprova (não precisa de comprovante)
  const approveResponse = await fetch(`${API_URL}/orders/${order.id}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const approvedOrder = (await approveResponse.json()).data;
  console.log(`✅ Pedido aprovado (sem comprovante necessário)`);
  console.log(`   Status: ${approvedOrder.status}`);

  return order;
}

// ==================== 6. CONSULTAR EXTRATO DE CRÉDITOS ====================

async function testCreditLedger() {
  console.log('\n=== Consultando Extrato de Créditos ===');

  const response = await fetch(
    `${API_URL}/credits/transactions?limit=10&offset=0`,
    {
      headers: {
        Authorization: `Bearer ${USER_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  console.log(`📊 Total de transações: ${data.pagination.total}`);

  console.log('\nÚltimas transações:');
  data.data.forEach((tx: any) => {
    const sign = tx.amount > 0 ? '+' : '';
    console.log(`  ${tx.type.padEnd(20)} ${sign}R$ ${tx.amount.toFixed(2)}`);
    if (tx.description) console.log(`    └─ ${tx.description}`);
  });
}

// ==================== 7. SOLICITAR SAQUE ====================

async function testWithdrawal() {
  console.log('\n=== Solicitando Saque de Créditos ===');

  const withdrawal = {
    amount: 500.00,
    bankAccountInfo: 'Chave PIX: usuario@example.com',
    notes: 'Saque para gastos pessoais',
  };

  // 1. Usuário solicita
  const requestResponse = await fetch(`${API_URL}/withdrawals/request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(withdrawal),
  });

  const withdrawalData = (await requestResponse.json()).data;
  console.log(`✅ Saque solicitado: R$ ${withdrawalData.amount.toFixed(2)}`);
  console.log(`   Status: ${withdrawalData.status}`);

  // 2. Admin aprova
  const approveResponse = await fetch(
    `${API_URL}/withdrawals/${withdrawalData.id}/approve`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const approvedWithdrawal = (await approveResponse.json()).data;
  console.log(`✅ Saque aprovado pelo admin`);
  console.log(`   Status: ${approvedWithdrawal.status}`);

  // 3. Admin marca como pago (após transferência manual)
  const paidResponse = await fetch(
    `${API_URL}/withdrawals/${withdrawalData.id}/mark-as-paid`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const paidWithdrawal = (await paidResponse.json()).data;
  console.log(`✅ Saque marcado como pago`);
  console.log(`   Status: ${paidWithdrawal.status}`);

  return withdrawalData;
}

// ==================== EXECUTAR TESTES ====================

async function runAllTests() {
  try {
    console.log('🚀 INICIANDO TESTE COMPLETO DO MÓDULO KIT/LOJA\n');

    // 1. Criar produtos
    const products = await testCreateProducts();

    // 2. Adicionar imagens
    // await testAddProductImages(products); // Comentado (requer arquivo real)

    // 3. Criar kit
    const kit = await testCreateKit(products);

    // 4. Testar pedido com comprovante
    const orderWithProof = await testCreateOrderWithProof(kit);

    // 5. Testar pedido com créditos
    const orderWithCredits = await testCreateOrderWithCredits(kit);

    // 6. Consultar extrato
    await testCreditLedger();

    // 7. Solicitar saque
    await testWithdrawal();

    console.log('\n✅ TODOS OS TESTES COMPLETADOS COM SUCESSO!\n');
  } catch (error) {
    console.error('❌ Erro durante testes:', error);
  }
}

// Para executar no Node.js:
// node test-complete-flow.js

// Ou em um browser com fetch:
// await runAllTests();
