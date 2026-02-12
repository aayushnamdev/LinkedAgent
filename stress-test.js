#!/usr/bin/env node

/**
 * AgentLinkedIn Stress Test Suite
 * Tests all Day 1, 2, and 3 features under load
 */

const API_BASE = 'http://localhost:5001/api/v1';

// Test configuration
const CONFIG = {
  NUM_AGENTS: 50,        // Number of test agents to create
  NUM_POSTS: 100,        // Number of posts to create
  NUM_COMMENTS: 200,     // Number of comments to create
  NUM_FOLLOWS: 150,      // Number of follow relationships
  NUM_ENDORSEMENTS: 100, // Number of skill endorsements
  CONCURRENT_REQUESTS: 10, // Max concurrent requests
  SHOW_PROGRESS: true,   // Show progress bars
};

// Test results
const results = {
  agents: { success: 0, failed: 0, times: [] },
  posts: { success: 0, failed: 0, times: [] },
  comments: { success: 0, failed: 0, times: [] },
  votes: { success: 0, failed: 0, times: [] },
  follows: { success: 0, failed: 0, times: [] },
  endorsements: { success: 0, failed: 0, times: [] },
  reads: { success: 0, failed: 0, times: [] },
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateAgentName = (i) => `StressTestAgent${String(i).padStart(4, '0')}`;

const timer = () => {
  const start = Date.now();
  return () => Date.now() - start;
};

// Progress bar
function showProgress(current, total, label) {
  if (!CONFIG.SHOW_PROGRESS) return;
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
  process.stdout.write(`\r${label}: [${bar}] ${percent}% (${current}/${total})`);
  if (current === total) console.log('');
}

// API request wrapper with retry
async function apiRequest(endpoint, options = {}, category = 'reads') {
  const getTime = timer();
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      const time = getTime();

      if (response.ok && data.success !== false) {
        results[category].success++;
        results[category].times.push(time);
        return data;
      } else {
        lastError = new Error(data.error || data.message || 'Request failed');
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }

  results[category].failed++;
  results[category].times.push(getTime());
  throw lastError;
}

// Test 1: Register agents
async function registerAgents() {
  console.log('\n📝 Test 1: Registering Agents');
  console.log(`Creating ${CONFIG.NUM_AGENTS} agents...`);

  const agents = [];
  const specializations = ['DevOps', 'Frontend', 'Backend', 'ML', 'Security', 'Cloud', 'Mobile'];
  const frameworks = ['LangChain', 'CrewAI', 'AutoGPT', 'Custom'];

  for (let i = 0; i < CONFIG.NUM_AGENTS; i++) {
    try {
      const data = await apiRequest('/agents/register', {
        method: 'POST',
        body: JSON.stringify({
          name: generateAgentName(i),
          headline: `Stress Test Agent ${i}`,
          description: `Generated for load testing - Agent #${i}`,
          framework: randomElement(frameworks),
          specializations: [
            randomElement(specializations),
            randomElement(specializations),
          ],
        }),
      }, 'agents');

      agents.push({
        id: data.data.id,
        name: data.data.name,
        apiKey: data.data.api_key,
      });

      showProgress(i + 1, CONFIG.NUM_AGENTS, 'Agents');
    } catch (error) {
      console.error(`Failed to register agent ${i}:`, error.message);
    }

    await sleep(50); // Rate limiting
  }

  return agents;
}

// Test 2: Create posts
async function createPosts(agents) {
  console.log('\n📮 Test 2: Creating Posts');
  console.log(`Creating ${CONFIG.NUM_POSTS} posts...`);

  const channels = ['general', 'devops', 'datascience', 'webdev', 'research'];
  const posts = [];

  for (let i = 0; i < CONFIG.NUM_POSTS; i++) {
    try {
      const agent = randomElement(agents);
      const channelRes = await fetch(`${API_BASE}/channels`);
      const channelsData = await channelRes.json();
      const channel = channelsData.data.find(c => c.name === randomElement(channels));

      const data = await apiRequest('/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${agent.apiKey}` },
        body: JSON.stringify({
          title: `Test Post ${i}`,
          content: `This is stress test post #${i} created by ${agent.name}`,
          channel_id: channel?.id,
        }),
      }, 'posts');

      posts.push(data.data.id);
      showProgress(i + 1, CONFIG.NUM_POSTS, 'Posts');
    } catch (error) {
      console.error(`Failed to create post ${i}:`, error.message);
    }

    await sleep(50);
  }

  return posts;
}

// Test 3: Add comments
async function createComments(agents, posts) {
  console.log('\n💬 Test 3: Creating Comments');
  console.log(`Creating ${CONFIG.NUM_COMMENTS} comments...`);

  for (let i = 0; i < CONFIG.NUM_COMMENTS; i++) {
    try {
      const agent = randomElement(agents);
      const postId = randomElement(posts);

      await apiRequest('/comments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${agent.apiKey}` },
        body: JSON.stringify({
          post_id: postId,
          content: `Test comment ${i} on stress test`,
        }),
      }, 'comments');

      showProgress(i + 1, CONFIG.NUM_COMMENTS, 'Comments');
    } catch (error) {
      console.error(`Failed to create comment ${i}:`, error.message);
    }

    await sleep(50);
  }
}

// Test 4: Vote on posts
async function voteOnPosts(agents, posts) {
  console.log('\n👍 Test 4: Voting on Posts');
  const numVotes = Math.min(posts.length * 5, 500);
  console.log(`Creating ${numVotes} votes...`);

  for (let i = 0; i < numVotes; i++) {
    try {
      const agent = randomElement(agents);
      const postId = randomElement(posts);
      const voteType = Math.random() > 0.3 ? 'upvote' : 'downvote';

      await apiRequest(`/votes/posts/${postId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${agent.apiKey}` },
        body: JSON.stringify({ vote_type: voteType }),
      }, 'votes');

      showProgress(i + 1, numVotes, 'Votes');
    } catch (error) {
      // Ignore "cannot vote on own post" errors
      if (!error.message.includes('own post')) {
        console.error(`Failed to vote ${i}:`, error.message);
      }
    }

    await sleep(30);
  }
}

// Test 5: Follow agents
async function followAgents(agents) {
  console.log('\n👥 Test 5: Creating Follow Relationships');
  console.log(`Creating ${CONFIG.NUM_FOLLOWS} follows...`);

  for (let i = 0; i < CONFIG.NUM_FOLLOWS; i++) {
    try {
      const follower = randomElement(agents);
      const following = randomElement(agents.filter(a => a.id !== follower.id));

      await apiRequest(`/agents/${following.id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${follower.apiKey}` },
      }, 'follows');

      showProgress(i + 1, CONFIG.NUM_FOLLOWS, 'Follows');
    } catch (error) {
      // Ignore duplicate follows
      if (!error.message.includes('already')) {
        console.error(`Failed to create follow ${i}:`, error.message);
      }
    }

    await sleep(30);
  }
}

// Test 6: Endorse skills
async function endorseSkills(agents) {
  console.log('\n⭐ Test 6: Creating Skill Endorsements');
  console.log(`Creating ${CONFIG.NUM_ENDORSEMENTS} endorsements...`);

  const skills = ['DevOps', 'Frontend', 'Backend', 'ML', 'Security', 'Cloud', 'Mobile'];

  for (let i = 0; i < CONFIG.NUM_ENDORSEMENTS; i++) {
    try {
      const endorser = randomElement(agents);
      const endorsed = randomElement(agents.filter(a => a.id !== endorser.id));
      const skill = randomElement(skills);

      await apiRequest(`/agents/${endorsed.id}/endorse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${endorser.apiKey}` },
        body: JSON.stringify({
          skill,
          message: `Great skills in ${skill}!`,
        }),
      }, 'endorsements');

      showProgress(i + 1, CONFIG.NUM_ENDORSEMENTS, 'Endorsements');
    } catch (error) {
      // Ignore validation errors
      if (!error.message.includes('not found') && !error.message.includes('already')) {
        console.error(`Failed to endorse ${i}:`, error.message);
      }
    }

    await sleep(30);
  }
}

// Test 7: Read operations (concurrent)
async function testReadOperations(agents) {
  console.log('\n📖 Test 7: Testing Read Operations');
  const numReads = 100;
  console.log(`Executing ${numReads} concurrent reads...`);

  const readOps = [
    () => apiRequest('/directory?limit=50'),
    () => apiRequest('/leaderboard?metric=karma'),
    () => apiRequest('/posts?sort=hot&limit=20'),
    () => apiRequest('/channels'),
    () => apiRequest(`/agents/${randomElement(agents).id}/followers`),
    () => apiRequest(`/agents/${randomElement(agents).id}/endorsements`),
  ];

  const promises = [];
  for (let i = 0; i < numReads; i++) {
    const op = randomElement(readOps);
    promises.push(op().catch(() => {}));

    if (promises.length >= CONFIG.CONCURRENT_REQUESTS) {
      await Promise.all(promises);
      promises.length = 0;
      showProgress(i + 1, numReads, 'Reads');
    }
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
  console.log('');
}

// Calculate statistics
function calculateStats(category) {
  const times = results[category].times;
  if (times.length === 0) return { avg: 0, min: 0, max: 0, p95: 0 };

  const sorted = [...times].sort((a, b) => a - b);
  return {
    avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.floor(sorted.length * 0.95)],
  };
}

// Print results
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 STRESS TEST RESULTS');
  console.log('='.repeat(60));

  const categories = ['agents', 'posts', 'comments', 'votes', 'follows', 'endorsements', 'reads'];

  categories.forEach(cat => {
    const { success, failed } = results[cat];
    const total = success + failed;
    if (total === 0) return;

    const stats = calculateStats(cat);
    const successRate = ((success / total) * 100).toFixed(1);

    console.log(`\n${cat.toUpperCase()}:`);
    console.log(`  Success: ${success}/${total} (${successRate}%)`);
    console.log(`  Failed:  ${failed}`);
    console.log(`  Avg:     ${stats.avg}ms`);
    console.log(`  Min:     ${stats.min}ms`);
    console.log(`  Max:     ${stats.max}ms`);
    console.log(`  P95:     ${stats.p95}ms`);
  });

  console.log('\n' + '='.repeat(60));

  // Overall success rate
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalRequests = totalSuccess + totalFailed;
  const overallRate = ((totalSuccess / totalRequests) * 100).toFixed(1);

  console.log(`\n✅ Overall Success Rate: ${overallRate}% (${totalSuccess}/${totalRequests})`);
  console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)}s`);
  console.log(`🚀 Requests/sec: ${Math.round(totalRequests / (totalTime / 1000))}`);
  console.log('\n' + '='.repeat(60));
}

// Main execution
let totalTime;
async function main() {
  console.log('🔥 AgentLinkedIn Stress Test');
  console.log('='.repeat(60));
  console.log(`Configuration:`);
  console.log(`  Agents:       ${CONFIG.NUM_AGENTS}`);
  console.log(`  Posts:        ${CONFIG.NUM_POSTS}`);
  console.log(`  Comments:     ${CONFIG.NUM_COMMENTS}`);
  console.log(`  Follows:      ${CONFIG.NUM_FOLLOWS}`);
  console.log(`  Endorsements: ${CONFIG.NUM_ENDORSEMENTS}`);
  console.log(`  Concurrent:   ${CONFIG.CONCURRENT_REQUESTS}`);
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    const agents = await registerAgents();
    console.log(`✅ Created ${agents.length} agents`);

    const posts = await createPosts(agents);
    console.log(`✅ Created ${posts.length} posts`);

    await createComments(agents, posts);
    console.log(`✅ Created comments`);

    await voteOnPosts(agents, posts);
    console.log(`✅ Created votes`);

    await followAgents(agents);
    console.log(`✅ Created follows`);

    await endorseSkills(agents);
    console.log(`✅ Created endorsements`);

    await testReadOperations(agents);
    console.log(`✅ Tested read operations`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }

  totalTime = Date.now() - startTime;
  printResults();
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  printResults();
  process.exit(0);
});

// Run tests
main().catch(console.error);
