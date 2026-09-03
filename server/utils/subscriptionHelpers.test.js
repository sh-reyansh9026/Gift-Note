import { calculateNewEndDate } from './subscriptionHelpers.js';

// Test cases for calculateNewEndDate function

console.log('Testing calculateNewEndDate function...\n');

// Test 1: Active renewal - existing endDate Sept 25, paid Sept 10, 1 month plan -> new endDate Oct 25
const test1CurrentDate = new Date('2024-09-10');
const test1ExistingSubscription = { endDate: new Date('2024-09-25') };
const test1Result = calculateNewEndDate(test1ExistingSubscription, 1, test1CurrentDate);
const test1Expected = new Date('2024-10-25');
console.log('Test 1 - Active renewal:');
console.log('  Existing endDate: Sept 25, 2024');
console.log('  Payment date: Sept 10, 2024');
console.log('  Plan: 1 month');
console.log('  Expected new endDate: Oct 25, 2024');
console.log('  Actual new endDate:', test1Result.toISOString().split('T')[0]);
console.log('  Result:', test1Result.getTime() === test1Expected.getTime() ? 'PASS' : 'FAIL');
console.log();

// Test 2: Expired renewal - existing endDate Aug 25, paid Sept 10, 1 month plan -> new endDate Oct 10
const test2CurrentDate = new Date('2024-09-10');
const test2ExistingSubscription = { endDate: new Date('2024-08-25') };
const test2Result = calculateNewEndDate(test2ExistingSubscription, 1, test2CurrentDate);
const test2Expected = new Date('2024-10-10');
console.log('Test 2 - Expired renewal:');
console.log('  Existing endDate: Aug 25, 2024');
console.log('  Payment date: Sept 10, 2024');
console.log('  Plan: 1 month');
console.log('  Expected new endDate: Oct 10, 2024');
console.log('  Actual new endDate:', test2Result.toISOString().split('T')[0]);
console.log('  Result:', test2Result.getTime() === test2Expected.getTime() ? 'PASS' : 'FAIL');
console.log();

// Test 3: No existing subscription
const test3CurrentDate = new Date('2024-09-10');
const test3ExistingSubscription = null;
const test3Result = calculateNewEndDate(test3ExistingSubscription, 1, test3CurrentDate);
const test3Expected = new Date('2024-10-10');
console.log('Test 3 - No existing subscription:');
console.log('  Payment date: Sept 10, 2024');
console.log('  Plan: 1 month');
console.log('  Expected new endDate: Oct 10, 2024');
console.log('  Actual new endDate:', test3Result.toISOString().split('T')[0]);
console.log('  Result:', test3Result.getTime() === test3Expected.getTime() ? 'PASS' : 'FAIL');
console.log();

// Test 4: 3 months plan with active subscription
const test4CurrentDate = new Date('2024-09-10');
const test4ExistingSubscription = { endDate: new Date('2024-09-25') };
const test4Result = calculateNewEndDate(test4ExistingSubscription, 3, test4CurrentDate);
const test4Expected = new Date('2024-12-25');
console.log('Test 4 - 3 months plan with active subscription:');
console.log('  Existing endDate: Sept 25, 2024');
console.log('  Payment date: Sept 10, 2024');
console.log('  Plan: 3 months');
console.log('  Expected new endDate: Dec 25, 2024');
console.log('  Actual new endDate:', test4Result.toISOString().split('T')[0]);
console.log('  Result:', test4Result.getTime() === test4Expected.getTime() ? 'PASS' : 'FAIL');
console.log();

// Test 5: 1 year plan with active subscription
const test5CurrentDate = new Date('2024-09-10');
const test5ExistingSubscription = { endDate: new Date('2024-09-25') };
const test5Result = calculateNewEndDate(test5ExistingSubscription, 12, test5CurrentDate);
const test5Expected = new Date('2025-09-25');
console.log('Test 5 - 1 year plan with active subscription:');
console.log('  Existing endDate: Sept 25, 2024');
console.log('  Payment date: Sept 10, 2024');
console.log('  Plan: 12 months (1 year)');
console.log('  Expected new endDate: Sept 25, 2025');
console.log('  Actual new endDate:', test5Result.toISOString().split('T')[0]);
console.log('  Result:', test5Result.getTime() === test5Expected.getTime() ? 'PASS' : 'FAIL');
console.log();

// Run the tests
console.log('All tests completed!');
