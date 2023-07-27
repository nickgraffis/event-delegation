import "./style.css";
import javascriptLogo from "./javascript.svg";

const TEST_BUTTON_ELEMENT = "testButton";
const AVG_CLICK_TIME_ELEMENT = "avgClickTime";
const MEMORY_ELEMENT = "memory";
const BUTTON_CONTAINER_ELEMENT = "buttonContainer";
const LOADER_ELEMENT = "loader";
const TEST_RUNS = 100;

const results = {};

function testClickPerformance(timesToAverage) {
  let totalClickTime = 0;
  for (let i = 0; i < timesToAverage; i++) {
    const button = document.querySelector("#buttonContainer button");
    const start = performance.now();
    button.click();
    const end = performance.now();
    totalClickTime += end - start;
  }
  return (totalClickTime / timesToAverage).toFixed(2);
}

function scheduleMemoryMeasurement() {
  const memory = window.performance.memory;
  return (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + " MB";
}

async function buildApp(counter, delegation) {
  // Remove existing buttons from previous test
  const buttonContainer = document.querySelector(
    `#${BUTTON_CONTAINER_ELEMENT}`
  );
  while (buttonContainer.firstChild) {
    buttonContainer.firstChild.remove();
  }

  for (let i = 0; i < counter; i++) {
    const button = document.createElement("button");
    button.innerText = `Button ${i}`;
    buttonContainer.appendChild(button);

    if (!delegation) {
      button.addEventListener("click", () => {});
    }
  }

  if (delegation) {
    buttonContainer.addEventListener("click", () => {});
  }

  let testClickTime = testClickPerformance(TEST_RUNS);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second for memory measurement
  let memoryUsage = scheduleMemoryMeasurement();
  return { testClickTime, memoryUsage };
}

async function performTest(counter) {
  // Show the loader
  document.querySelector(`#spinner`).classList.remove("hidden");

  // Perform the tests
  let result = await buildApp(counter, true);
  results[counter] = {
    delegation: result,
  };
  await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 seconds

  result = await buildApp(counter, false);
  results[counter].noDelegation = result;

  // Hide the loader
  document.querySelector(`#spinner`).classList.add("hidden");
}

document.querySelector("#app").innerHTML = `
<img src="${javascriptLogo}" alt="Javascript Logo" />
  <h1>Event Delegation Test</h1>
  <button id="${TEST_BUTTON_ELEMENT}">Run Test</button>
  <div id="${LOADER_ELEMENT}" style="width: 100%; display: flex; justify-content: center; padding-top: 10px;
  ">
    <div id="spinner" class="spinner hidden"></div>
  </div>
  <p id="${AVG_CLICK_TIME_ELEMENT}"></p>
  <p id="${MEMORY_ELEMENT}"></p>
  <div id="${BUTTON_CONTAINER_ELEMENT}" style="display:none;"></div>
`;

function displayResults() {
  const avgClickTimeElement = document.querySelector(
    `#${AVG_CLICK_TIME_ELEMENT}`
  );
  const memoryElement = document.querySelector(`#${MEMORY_ELEMENT}`);

  avgClickTimeElement.innerHTML = "";
  memoryElement.innerHTML = "";

  Object.keys(results).forEach((key) => {
    const result = results[key];
    avgClickTimeElement.innerHTML += `<p>Click time for ${key} buttons: ${result.noDelegation.testClickTime}ms (no delegation) vs ${result.delegation.testClickTime}ms (delegation)</p>`;
    memoryElement.innerHTML += `<p>Memory usage for ${key} buttons: ${result.noDelegation.memoryUsage} (no delegation) vs ${result.delegation.memoryUsage} (delegation)</p>`;
  });
}

document
  .querySelector(`#${TEST_BUTTON_ELEMENT}`)
  .addEventListener("click", async () => {
    await performTest(100);
    await performTest(1000);
    await performTest(10000);
    await performTest(100000);
    displayResults();
  });

document.querySelector(`#${LOADER_ELEMENT}`).classList.remove("hidden");
