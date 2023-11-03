const readline = require("readline");

const jobs = [];
let jobCount = 0;

// input parser
const readInput = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// convert HHMM to minutes
const timeToMinutes = (time) => {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return hours * 60 + minutes;
};

// Function to find the last non-conflicting job index
function findLastNonConflictingJob(jobs, i) {
  for (let j = i - 1; j >= 0; j--) {
    if (timeToMinutes(jobs[j].end) <= timeToMinutes(jobs[i].start)) {
      return j;
    }
  }
  return -1;
}

// find the maximum earnings
function findMaxEarnings(jobs) {
  // sort jobs by end time
  jobs.sort((jobA, jobB) => timeToMinutes(jobA.end) - timeToMinutes(jobB.end));

  const noOfJobs = jobs.length;
  const dp = new Array(noOfJobs).fill(0);
  dp[0] = jobs[0].profit;

  for (let i = 1; i < noOfJobs; i++) {
    let inclProfit = jobs[i].profit;
    const l = findLastNonConflictingJob(jobs, i);
    if (l != -1) {
      inclProfit += dp[l];
    }
    dp[i] = Math.max(dp[i - 1], inclProfit);
  }

  // find previous selected jobs
  const selectedJobs = new Set();
  let i = noOfJobs - 1;
  while (i >= 0) {
    if (i === 0 || dp[i] !== dp[i - 1]) {
      selectedJobs.add(i);
      i = findLastNonConflictingJob(jobs, i) ?? -1;
    } else {
      i--;
    }
  }

  // filter out the selected jobs
  const remainingJobs = jobs.filter((_, index) => !selectedJobs.has(index));
  const remainingEarnings = remainingJobs.reduce(
    (acc, job) => acc + job.profit,
    0
  );

  return [remainingJobs.length, remainingEarnings];
}

const getJobDetails = (index) => {
  if (index >= jobCount) {
    const result = findMaxEarnings(jobs);
    console.log("The number of tasks and earnings available for others");
    console.log("Task:", result[0]);
    console.log("Earnings:", result[1]);
    readInput.close();
    return;
  }

  readInput.question(
    `Enter job ${
      index + 1
    } start time, end time, and earnings (comma separated): `,
    (input) => {
      const [start, end, profit] = input
        .split(",")
        .map((str) => Number(str.trim()));
      jobs.push({ start, end, profit });
      getJobDetails(index + 1);
    }
  );
};

readInput.question("Enter the number of Jobs: ", (input) => {
  jobCount = parseInt(input, 10);
  getJobDetails(0);
});
