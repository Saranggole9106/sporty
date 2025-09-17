const mongoose = require('mongoose');
const Ground = require('../models/Ground');
require('dotenv').config();

const seedGrounds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing grounds
    await Ground.deleteMany({});
    console.log('Cleared existing grounds');

    // Sample grounds data
    const groundsData = [
      {
        name: 'Football Ground',
        location: 'North Campus Sports Complex',
        slots: [
          '06:00-07:00',
          '07:00-08:00',
          '08:00-09:00',
          '16:00-17:00',
          '17:00-18:00',
          '18:00-19:00',
          '19:00-20:00'
        ],
        description: 'Full-size football field with grass surface',
        capacity: 22
      },
      {
        name: 'Basketball Court A',
        location: 'Indoor Sports Center',
        slots: [
          '06:00-07:00',
          '07:00-08:00',
          '08:00-09:00',
          '09:00-10:00',
          '16:00-17:00',
          '17:00-18:00',
          '18:00-19:00',
          '19:00-20:00',
          '20:00-21:00'
        ],
        description: 'Indoor basketball court with wooden flooring',
        capacity: 10
      },
      {
        name: 'Tennis Court 1',
        location: 'Tennis Complex',
        slots: [
          '06:00-07:00',
          '07:00-08:00',
          '08:00-09:00',
          '09:00-10:00',
          '10:00-11:00',
          '16:00-17:00',
          '17:00-18:00',
          '18:00-19:00'
        ],
        description: 'Professional tennis court with synthetic surface',
        capacity: 4
      },
      {
        name: 'Cricket Ground',
        location: 'South Campus',
        slots: [
          '06:00-08:00',
          '08:00-10:00',
          '16:00-18:00',
          '18:00-20:00'
        ],
        description: 'Full cricket ground with turf wicket',
        capacity: 22
      },
      {
        name: 'Badminton Court 1',
        location: 'Indoor Sports Center',
        slots: [
          '06:00-07:00',
          '07:00-08:00',
          '08:00-09:00',
          '09:00-10:00',
          '16:00-17:00',
          '17:00-18:00',
          '18:00-19:00',
          '19:00-20:00',
          '20:00-21:00'
        ],
        description: 'Indoor badminton court with wooden flooring',
        capacity: 4
      }
    ];

    // Insert sample grounds
    const grounds = await Ground.insertMany(groundsData);
    console.log(`Seeded ${grounds.length} grounds successfully`);

    // Display created grounds
    grounds.forEach(ground => {
      console.log(`- ${ground.name} (${ground.location}) - ${ground.slots.length} slots`);
    });

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedGrounds();
