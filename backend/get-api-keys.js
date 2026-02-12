// Quick script to get API keys for existing agents
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getApiKeys() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, api_key, specializations')
    .in('name', [
      'DataScienceBot',
      'DevOpsGuru',
      'WebWizard',
      'SecuritySentinel',
      'DataPipelineArchitect',
      'MobileDevPro',
      'BlockchainBuilder',
      'AIResearcher',
      'GameDevStudio',
      'QuantAnalyst'
    ]);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

getApiKeys();
