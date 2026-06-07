require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const connectDB = require('./config/db');

const User = require('./models/User');
const Customer = require('./models/Customer');
const Match = require('./models/Match');
const Note = require('./models/Note');

// Seed Data Configuration
const NUM_MATCHMAKERS = 20;
const NUM_PROFILES_PER_GENDER = 100;

// Indian context data arrays
const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const colleges = ['IIT Bombay', 'IIT Delhi', 'IIM Ahmedabad', 'NIT Trichy', 'BITS Pilani', 'Delhi University', 'SRCC', 'Anna University', 'Manipal Institute of Technology'];
const degrees = ['B.Tech', 'MBA', 'MBBS', 'B.Com', 'B.A.', 'M.Tech', 'CA', 'B.Sc'];
const companies = ['Google', 'Microsoft', 'TCS', 'Infosys', 'Reliance', 'Wipro', 'Amazon', 'Accenture', 'HDFC Bank', 'Startup'];
const designations = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Consultant', 'Doctor', 'Entrepreneur', 'Analyst', 'Manager'];
const religions = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist'];
const castes = ['Brahmin', 'Rajput', 'Bania', 'Kayastha', 'Jat', 'Khatri', 'Maratha', 'Reddy', 'Iyer', 'Iyengar'];
const motherTongues = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam'];
const personalityTypes = ['Introvert', 'Extrovert', 'Ambivert'];
const statusTags = ['New Lead', 'Profile Review', 'Searching', 'Match Sent', 'Matched', 'Inactive'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, maxItems) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * maxItems) + 1);
};

const generateProfiles = async (matchmakers, gender, count) => {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    const dob = faker.date.birthdate({ min: 22, max: 40, mode: 'age' });
    const profile = {
      firstName: faker.person.firstName(gender.toLowerCase()),
      lastName: faker.person.lastName(),
      gender: gender,
      dob: dob,
      country: 'India',
      city: getRandomElement(indianCities),
      height: gender === 'Male' ? faker.number.int({ min: 165, max: 190 }) : faker.number.int({ min: 150, max: 175 }),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: 'national' }),
      college: getRandomElement(colleges),
      degree: getRandomElement(degrees),
      income: faker.number.int({ min: 800000, max: 50000000 }), // 8L to 5Cr
      company: getRandomElement(companies),
      designation: getRandomElement(designations),
      maritalStatus: faker.helpers.arrayElement(['Never Married', 'Never Married', 'Never Married', 'Divorced']), // Skew towards Never Married
      languages: getRandomSubset(motherTongues, 3),
      siblings: faker.number.int({ min: 0, max: 3 }),
      caste: getRandomElement(castes),
      religion: getRandomElement(religions),
      wantKids: faker.helpers.arrayElement(['Yes', 'No', 'Maybe', 'Not Sure']),
      relocate: faker.helpers.arrayElement(['Yes', 'No', 'Maybe']),
      pets: faker.helpers.arrayElement(['Yes', 'No', 'Open to it']),
      hobbies: getRandomSubset(['Reading', 'Traveling', 'Cooking', 'Sports', 'Music', 'Photography', 'Gaming', 'Fitness'], 3),
      interests: getRandomSubset(['Technology', 'Art', 'Finance', 'Startups', 'Movies', 'Nature'], 3),
      personalityType: getRandomElement(personalityTypes),
      dietPreference: faker.helpers.arrayElement(['Veg', 'Non-Veg', 'Vegan', 'Eggetarian']),
      smoking: faker.helpers.arrayElement(['Yes', 'No', 'Occasionally']),
      drinking: faker.helpers.arrayElement(['Yes', 'No', 'Occasionally']),
      familyType: faker.helpers.arrayElement(['Nuclear', 'Joint']),
      motherTongue: getRandomElement(motherTongues),
      statusTag: getRandomElement(statusTags),
      assignedMatchmaker: getRandomElement(matchmakers)._id,
      profilePicture: `https://i.pravatar.cc/300?u=${faker.string.uuid()}`,
      aiSummary: 'Pending AI Analysis.'
    };
    profiles.push(profile);
  }
  return profiles;
};

const seedDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set in environment variables.');
      process.exit(1);
    }

    await connectDB();
    console.log('Clearing database...');
    await User.deleteMany();
    await Customer.deleteMany();
    await Match.deleteMany();
    await Note.deleteMany();

    console.log('Generating Matchmakers...');
    const matchmakersData = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (let i = 0; i < NUM_MATCHMAKERS; i++) {
      matchmakersData.push({
        username: `matchmaker${i + 1}`,
        password: hashedPassword,
        role: 'matchmaker'
      });
    }
    const matchmakers = await User.insertMany(matchmakersData);

    console.log(`Generating ${NUM_PROFILES_PER_GENDER} Male Profiles...`);
    const maleProfiles = await generateProfiles(matchmakers, 'Male', NUM_PROFILES_PER_GENDER);
    
    console.log(`Generating ${NUM_PROFILES_PER_GENDER} Female Profiles...`);
    const femaleProfiles = await generateProfiles(matchmakers, 'Female', NUM_PROFILES_PER_GENDER);

    await Customer.insertMany([...maleProfiles, ...femaleProfiles]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding DB: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
