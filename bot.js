import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import { saveProfile, getProfile, saveTriviaScore, getTriviaScore, storeJoke } from './gameFunctions.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.on('guildMemberAdd', async (member) => {
  member.send(`Welcome to the server, ${member.displayName}! Type !profile to set up your profile.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // Profile Command
  if (message.content.startsWith('!profile')) {
    const profileData = await getProfile(userId);
    if (profileData) {
      message.channel.send(`Profile of ${message.author.username}: \nUsername: ${profileData.username}\nAge: ${profileData.age}\nBio: ${profileData.bio}`);
    } else {
      message.channel.send('No profile found. Type !setprofile to create your profile.');
    }
  }

  // Set Profile Command
  if (message.content.startsWith('!setprofile')) {
    const [_, username, age, ...bioParts] = message.content.split(' ');
    const bio = bioParts.join(' ');
    await saveProfile(userId, username, age, bio);
    message.channel.send(`Profile created for ${message.author.username}!`);
  }

  // Start Game Command
  if (message.content === '!startgame') {
    await saveTriviaScore(userId, 0); // Initialize or reset score to 0
    message.channel.send(`Game started for ${message.author.username}! Type !trivia to get your first question.`);
  }

  // Score Command
  if (message.content === '!score') {
    const score = await getTriviaScore(userId);
    message.channel.send(`${message.author.username}, your current score is: ${score}`);
  }

  // Leaderboard Command
  if (message.content === '!leaderboard') {
    const leaderboard = await getLeaderboard();
    let leaderboardMessage = '🏆 Trivia Leaderboard 🏆\n\n';
    leaderboard.forEach((entry, index) => {
      leaderboardMessage += `${index + 1}. ${entry.username}: ${entry.triviaScore} points\n`;
    });
    message.channel.send(leaderboardMessage);
  }

  // Hint Command
  if (message.content === '!hint') {
    const hints = [
      "This famous city is also known as the 'City of Lights'.",
      "The painter of the Mona Lisa was a Renaissance genius.",
      "This ocean is the largest and lies between Asia and the Americas."
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    message.channel.send(`Hint: ${randomHint}`);
  }

  // Trivia Game
  if (message.content === '!trivia') {
    const questions = [
      { question: 'What is the capital of France?', answer: 'Paris' },
      { question: 'Who painted the Mona Lisa?', answer: 'Leonardo Da Vinci' },
      { question: 'What is the largest ocean?', answer: 'Pacific Ocean' },
    ];

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    message.channel.send(randomQuestion.question);

    const filter = (response) => response.author.id === message.author.id;
    try {
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ['time'],
      });
      const userAnswer = collected.first().content;
      let score = 0;
      if (userAnswer.toLowerCase() === randomQuestion.answer.toLowerCase()) {
        score = 1;
        message.channel.send('✅ Correct!');
      } else {
        message.channel.send(`❌ Incorrect! The correct answer was: ${randomQuestion.answer}`);
      }
      await saveTriviaScore(userId, score);
    } catch (error) {
      message.channel.send("⏰ Time's up!");
    }
  }

  // Joke Command
  if (message.content === '!joke') {
    const jokes = [
      "Why don’t skeletons fight each other? They don’t have the guts.",
      "I told my computer I needed a break, and now it won’t stop sending me Kit-Kats.",
      "Parallel lines have so much in common. It’s a shame they’ll never meet."
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    message.channel.send(randomJoke);
    await storeJoke(userId, randomJoke);
  }
});

client.on('ready', () => {
  console.log("Bot is ready!");
});



// Firestore function to get leaderboard
export const getLeaderboard = async () => {
  const scoresRef = db.collection('userScores').orderBy('triviaScore', 'desc').limit(10);
  const snapshot = await scoresRef.get();
  const leaderboard = [];
  snapshot.forEach((doc) => {
    leaderboard.push({ username: doc.id, triviaScore: doc.data().triviaScore });
  });
  return leaderboard;
};


// Log the bot in (replace with your bot's token)
client.login('MTMwNTkyMDY2NDgzMzg4NDE5MA.Gn0WKp.MrkhVG5AZ8bkSQZf4y9dDHpAqCHaYKdLfnnY78');  // Replace with your actual bot token
