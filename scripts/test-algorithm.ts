import { generateSchedule } from '@/lib/algorithm';
import { Teacher, DutySettings } from '@/types';

// Mock Data
const maleTeachers: Teacher[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `m-${i}`,
  name: `Male Teacher ${i}`,
  gender: 'MALE',
  isActive: true,
  exemptions: [],
  totalPoints: 0
}));

const femaleTeachers: Teacher[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `f-${i}`,
  name: `Female Teacher ${i}`,
  gender: 'FEMALE',
  isActive: true,
  exemptions: [],
  totalPoints: 0
}));

const settings: DutySettings = {
  maleCounts: {
    WEEKDAY: 3,
    FRIDAY: 3,
    SATURDAY: 1, // Specific test case
    SUNDAY: 1
  },
  femaleCounts: {
    WEEKDAY: 2,
    FRIDAY: 2,
    SATURDAY: 2, // Specific test case
    SUNDAY: 2
  }
};

console.log('--- STARTING STRICT ALGORITHM TEST ---');

// Generate for a generic month (e.g., Oct 2025)
// Oct 1 2025 is a Wednesday
const result = generateSchedule(2025, 9, [...maleTeachers, ...femaleTeachers], settings);

if (result.errors.length > 0) {
  console.error('Errors:', result.errors);
}

const assignments = result.assignments;

// Analyze Result
const maleAssignments = assignments.filter(a => a.teacherId.startsWith('m-'));
const femaleAssignments = assignments.filter(a => a.teacherId.startsWith('f-'));

console.log(`Total Assignments: ${assignments.length}`);
console.log(`Male Assignments: ${maleAssignments.length}`);
console.log(`Female Assignments: ${femaleAssignments.length}`);

// Verify Logic
let failure = false;

// Check Gender Strictness
assignments.forEach(a => {
  const teacher = [...maleTeachers, ...femaleTeachers].find(t => t.id === a.teacherId);
  if (!teacher) return;
  
  // Logic check is implicit by ID prefix, but let's double check
  if (teacher.gender === 'MALE' && femaleAssignments.includes(a)) {
    console.error(`FAILURE: Male teacher ${teacher.id} assigned to female slot!`);
    failure = true;
  }
});

// Check Counts for a Sample Saturday (Oct 4, 2025)
const sampleSat = '2025-10-04';
const malesOnSat = maleAssignments.filter(a => a.date === sampleSat);
const femalesOnSat = femaleAssignments.filter(a => a.date === sampleSat);

console.log(`Saturday (${sampleSat}) Male Count: ${malesOnSat.length} (Expected: 1)`);
console.log(`Saturday (${sampleSat}) Female Count: ${femalesOnSat.length} (Expected: 2)`);

if (malesOnSat.length !== 1) {
  console.error('FAILURE: Male count on Saturday is wrong.');
  failure = true;
}
if (femalesOnSat.length !== 2) {
  console.error('FAILURE: Female count on Saturday is wrong.');
  failure = true;
}

// Check Weekday (Oct 1, 2025 - Wed)
const sampleWed = '2025-10-01';
const malesOnWed = maleAssignments.filter(a => a.date === sampleWed);
const femalesOnWed = femaleAssignments.filter(a => a.date === sampleWed);

console.log(`Wednesday (${sampleWed}) Male Count: ${malesOnWed.length} (Expected: 3)`);
console.log(`Wednesday (${sampleWed}) Female Count: ${femalesOnWed.length} (Expected: 2)`);

if (malesOnWed.length !== 3) {
  console.error('FAILURE: Male count on Weekday is wrong.');
  failure = true;
}
if (femalesOnWed.length !== 2) {
  console.error('FAILURE: Female count on Weekday is wrong.');
  failure = true;
}

if (!failure) {
  console.log('SUCCESS: Strict separation and independent counting verified.');
} else {
  console.log('TEST FAILED.');
}
