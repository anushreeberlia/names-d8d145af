const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Name data
const nameData = {
  first: {
    male: ['Alexander', 'James', 'Michael', 'William', 'David', 'Robert', 'John', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle']
  },
  last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'],
  fantasy: ['Aeliana', 'Thorgar', 'Zephyra', 'Drakmor', 'Lyralei', 'Gorvek', 'Seraphina', 'Vorthak', 'Elyndra', 'Grimjaw', 'Celestine', 'Morgrim', 'Vaeleth', 'Thorgrim', 'Aurelia', 'Drakthul', 'Mystara', 'Ironforge', 'Velanna', 'Shadowmere'],
  company: ['TechFlow', 'DataSync', 'CloudVault', 'ByteForge', 'QuantumLab', 'NeuralLink', 'CyberCore', 'InfoStream', 'DigitalEdge', 'SmartGrid', 'NetWorks', 'CodeCraft', 'DataFlow', 'TechSphere', 'PixelPro', 'LogicWave', 'SystemCore', 'DevSync', 'CloudMind', 'InnovateTech']
};

// Initialize data file
async function initializeData() {
  try {
    await fs.mkdir('/data', { recursive: true });
    const dataPath = '/data/names.json';
    
    try {
      await fs.access(dataPath);
    } catch {
      await fs.writeFile(dataPath, JSON.stringify(nameData, null, 2));
      console.log('Initialized names data file');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Get random name
app.get('/api/random-name', async (req, res) => {
  try {
    const { type, gender } = req.query;
    const dataPath = '/data/names.json';
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    let randomName = '';
    
    switch (type) {
      case 'full':
        const firstNames = gender === 'male' ? data.first.male : data.first.female;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = data.last[Math.floor(Math.random() * data.last.length)];
        randomName = `${firstName} ${lastName}`;
        break;
      case 'first':
        const names = gender === 'male' ? data.first.male : data.first.female;
        randomName = names[Math.floor(Math.random() * names.length)];
        break;
      case 'last':
        randomName = data.last[Math.floor(Math.random() * data.last.length)];
        break;
      case 'fantasy':
        randomName = data.fantasy[Math.floor(Math.random() * data.fantasy.length)];
        break;
      case 'company':
        randomName = data.company[Math.floor(Math.random() * data.company.length)];
        break;
      default:
        return res.status(400).json({ error: 'Invalid name type' });
    }
    
    console.log(`Generated ${type} name: ${randomName}`);
    res.json({ name: randomName, type, gender: gender || 'neutral' });
  } catch (error) {
    console.error('Error generating name:', error);
    res.status(500).json({ error: 'Failed to generate name' });
  }
});

// Get name categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'full', name: 'Full Name', hasGender: true },
    { id: 'first', name: 'First Name', hasGender: true },
    { id: 'last', name: 'Last Name', hasGender: false },
    { id: 'fantasy', name: 'Fantasy Name', hasGender: false },
    { id: 'company', name: 'Company Name', hasGender: false }
  ];
  
  res.json({ categories });
});

// Start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Name generator server running on port ${PORT}`);
  });
});