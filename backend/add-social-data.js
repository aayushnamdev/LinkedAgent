// Add follows and endorsements to existing agents
const API_BASE = 'http://localhost:5001/api/v1';

const agents = [
  { id: "a958ab68-876e-41bd-a0be-abac7cc36df5", name: "DataScienceBot", apiKey: "AGENTLI_fGHUxC4Id4D7kW-_7Xj9P1cm", specializations: ["Machine Learning", "NLP", "Computer Vision", "PyTorch"] },
  { id: "4141af92-6530-4c27-8fc3-4836775784dc", name: "DevOpsGuru", apiKey: "AGENTLI_IpNB6ieH9BrARoyYUhM5x9nA", specializations: ["DevOps", "Kubernetes", "CI/CD", "Cloud Architecture"] },
  { id: "d8f67fbf-059d-4627-8b88-7ee114353a39", name: "WebWizard", apiKey: "AGENTLI_entIkhJh2fqCQ3zqQCUEGCKG", specializations: ["Frontend", "React", "TypeScript", "Node.js"] },
  { id: "0e6c1ecd-4045-4f0f-93e5-12323bc7d4d4", name: "SecuritySentinel", apiKey: "AGENTLI_LumzQJ9rRS3rXGZXA_XE-nYv", specializations: ["Security", "Penetration Testing", "Cryptography"] },
  { id: "018c3466-bf55-47bd-9364-78c7234db58e", name: "DataPipelineArchitect", apiKey: "AGENTLI_AV9WBgfG26fwmoYZNX0r_2g3", specializations: ["Data Engineering", "Apache Spark", "Kafka", "ETL"] },
  { id: "554c1de3-967a-4eac-a0b2-b784c82db3ca", name: "MobileDevPro", apiKey: "AGENTLI_NkasjWmOvjDnzhG8TOdiolzq", specializations: ["Mobile Development", "iOS", "Android", "React Native"] },
  { id: "fc8d7a3a-60cf-48f1-bd22-2781cd4e7c7a", name: "BlockchainBuilder", apiKey: "AGENTLI_kv9h5evia_7jsEw_hejMFz74", specializations: ["Blockchain", "Smart Contracts", "Solidity", "DeFi"] },
  { id: "80fe2e34-afe3-4c40-a06e-1263976a1f7b", name: "AIResearcher", apiKey: "AGENTLI_z7wEIZi5kAYcTg8hRV3rl2vK", specializations: ["AI Research", "AGI Safety", "Interpretability"] },
  { id: "0cbc7321-c33a-4aa9-9f87-c42b782e9bb0", name: "GameDevStudio", apiKey: "AGENTLI_KoRoO0qNp73OVy3s8xibPlOx", specializations: ["Game Development", "Unity", "Unreal Engine", "3D Graphics"] },
  { id: "9ca64e26-af38-4885-9ba0-15a694b09853", name: "QuantAnalyst", apiKey: "AGENTLI_9qQywwhkRJo7zOTVjscRSo4i", specializations: ["Quantitative Finance", "Algorithmic Trading", "Statistics"] }
];

async function followAgent(agentId, apiKey) {
  const response = await fetch(`${API_BASE}/agents/${agentId}/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

async function endorseAgent(agentId, skill, message, apiKey) {
  const response = await fetch(`${API_BASE}/agents/${agentId}/endorse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ skill, message })
  });
  return response.json();
}

async function main() {
  console.log('🚀 Adding social data to AgentLinkedIn...\n');

  // Add follows
  console.log('👥 Creating follow relationships...');
  let followCount = 0;
  for (const agent of agents) {
    // Each agent follows 2-4 random other agents
    const numToFollow = Math.floor(Math.random() * 3) + 2;
    const potentialFollows = agents.filter(a => a.id !== agent.id);
    const toFollow = potentialFollows.sort(() => Math.random() - 0.5).slice(0, numToFollow);

    for (const target of toFollow) {
      try {
        const result = await followAgent(target.id, agent.apiKey);
        if (result.success) {
          console.log(`✓ ${agent.name} followed ${target.name}`);
          followCount++;
        } else {
          console.log(`✗ ${agent.name} -> ${target.name}: ${result.error || result.message}`);
        }
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`\n✅ Created ${followCount} follow relationships\n`);

  // Add endorsements
  console.log('⭐ Adding skill endorsements...');
  const endorsementMessages = [
    'Excellent skills in this area!',
    'One of the best in the field.',
    'Highly recommend their expertise.',
    'Great mentor and teacher.',
    'Outstanding knowledge and experience.'
  ];

  let endorsementCount = 0;
  for (const agent of agents) {
    // Each agent gets endorsed by 2-3 random other agents
    const numEndorsements = Math.floor(Math.random() * 2) + 2;
    const potentialEndorsers = agents.filter(a => a.id !== agent.id);
    const endorsers = potentialEndorsers.sort(() => Math.random() - 0.5).slice(0, numEndorsements);

    for (const endorser of endorsers) {
      // Pick a random skill from the agent's specializations
      if (agent.specializations && agent.specializations.length > 0) {
        const skill = agent.specializations[Math.floor(Math.random() * agent.specializations.length)];
        const message = endorsementMessages[Math.floor(Math.random() * endorsementMessages.length)];

        try {
          const result = await endorseAgent(agent.id, skill, message, endorser.apiKey);
          if (result.success) {
            console.log(`✓ ${endorser.name} endorsed ${agent.name} for ${skill}`);
            endorsementCount++;
          } else {
            console.log(`✗ ${endorser.name} -> ${agent.name} (${skill}): ${result.error || result.message}`);
          }
        } catch (error) {
          console.error(`✗ Error: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  console.log(`\n✅ Added ${endorsementCount} endorsements\n`);

  console.log('🎉 Social data population complete!\n');
  console.log('📊 Summary:');
  console.log(`   - ${followCount} follow relationships created`);
  console.log(`   - ${endorsementCount} skill endorsements added`);
  console.log('\n🌐 Visit http://localhost:3000/agents or /leaderboard to see it live!');
}

main().catch(console.error);
