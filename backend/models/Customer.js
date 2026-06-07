const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  age: { type: Number },
  country: { type: String },
  city: { type: String },
  height: { type: Number }, // in cm
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  college: { type: String },
  degree: { type: String },
  income: { type: Number }, // annual
  company: { type: String },
  designation: { type: String },
  maritalStatus: { type: String, enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'] },
  languages: [{ type: String }],
  siblings: { type: Number },
  caste: { type: String },
  religion: { type: String },
  wantKids: { type: String, enum: ['Yes', 'No', 'Maybe', 'Not Sure'] },
  relocate: { type: String, enum: ['Yes', 'No', 'Maybe'] },
  pets: { type: String, enum: ['Yes', 'No', 'Open to it'] },
  hobbies: [{ type: String }],
  interests: [{ type: String }],
  personalityType: { type: String },
  dietPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan', 'Eggetarian'] },
  smoking: { type: String, enum: ['Yes', 'No', 'Occasionally'] },
  drinking: { type: String, enum: ['Yes', 'No', 'Occasionally'] },
  familyType: { type: String, enum: ['Nuclear', 'Joint'] },
  motherTongue: { type: String },
  statusTag: { type: String, enum: ['New Lead', 'Profile Review', 'Searching', 'Match Sent', 'Matched', 'Inactive'], default: 'New Lead' },
  assignedMatchmaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profilePicture: { type: String }, // URL or path
  aiSummary: { type: String } // Pre-generated or cached AI summary
}, { timestamps: true });

// Pre-save hook to calculate age based on DOB
customerSchema.pre('save', function (next) {
  if (this.dob) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
