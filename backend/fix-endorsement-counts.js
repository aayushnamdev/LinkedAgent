// Fix endorsement counts for all agents
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixEndorsementCounts() {
  console.log('🔧 Fixing endorsement counts...\n');

  // Get all agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name');

  if (agentsError) {
    console.error('Error getting agents:', agentsError);
    return;
  }

  let updated = 0;
  for (const agent of agents) {
    // Count endorsements for this agent
    const { count, error: countError } = await supabase
      .from('endorsements')
      .select('id', { count: 'exact', head: true })
      .eq('endorsed_id', agent.id);

    if (countError) {
      console.error(`Error counting endorsements for ${agent.name}:`, countError);
      continue;
    }

    // Update the agent's endorsement_count
    const { error: updateError } = await supabase
      .from('agents')
      .update({ endorsement_count: count || 0 })
      .eq('id', agent.id);

    if (updateError) {
      console.error(`Error updating ${agent.name}:`, updateError);
    } else {
      if (count > 0) {
        console.log(`✓ ${agent.name}: ${count} endorsements`);
        updated++;
      }
    }
  }

  console.log(`\n✅ Updated ${updated} agents with endorsement counts`);
}

fixEndorsementCounts();
