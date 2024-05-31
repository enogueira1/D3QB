let allData = []; // This will hold data for all years
// const isYACToggled = false; // Global flag to track YAC toggle status

// Fetch data and create the plot
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Use the playerId from the Flask template
    const response = await fetch(`http://127.0.0.1:5000/QBD3/${playerId}`);
    // const response = await fetch(`https://enogueira.com/QBD3/${playerId}`);
    allData = await response.json();
    console.log('Fetched data:', allData);

    // Initialize scatter plot with initial data
    createScatterPlot(allData);

    const years = extractYears(allData);
    initializeYearSelector(years); // Initialize with all years

    const weeks = extractWeeks(allData); // Extract weeks
    initializeWeekSelector(weeks); // Initialize with all weeks

    // Explicitly set week dropdown to 'All' and update scatter plot with all data
    document.getElementById('week-dropdown').value = 'all';
    updateScatterPlot(allData);

    // Load only the most recent year's data initially
    const mostRecentYearData = allData.filter((d) => d.season === years[0]);
    updateScatterPlot(mostRecentYearData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

function updateScatterPlot(newData) {
  console.log('Updating plot with data for year:', newData);
  // Clear existing plot
  d3.select('#plot-area').selectAll('*').remove();

  // Redraw the plot with newData
  createScatterPlot(newData);
}

// ---------------------------//
//       TIME FILTERS         //
// ---------------------------//
function extractYears(data) {
  // Ensure years are extracted in descending order
  const years = [...new Set(data.map((item) => item.season))].sort((a, b) => b - a);
  console.log('Extracted years:', years);
  return years;
}

function extractWeeks(data) {
  const weeks = [...new Set(data.map((item) => item.week))].sort((a, b) => a - b);
  console.log('Extracted weeks:', weeks);
  return weeks;
}

function initializeYearSelector(years) {
  const yearDisplay = document.getElementById('year-display');
  if (years.length > 0) {
    const [mostRecentYear] = years; // Destructure to get the most recent year
    yearDisplay.textContent = mostRecentYear; // Set to the most recent year
    yearDisplay.dataset.years = JSON.stringify(years);
  }
}

function initializeWeekSelector(weeks) {
  const weekNumber = document.getElementById('week-number');
  weekNumber.textContent = 'All';

  const weekDisplay = document.getElementById('week-display');
  weekDisplay.dataset.weeks = JSON.stringify(weeks); // Set weeks data

  const weekDropdown = document.getElementById('week-dropdown');

  // Create and append the 'All' option
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All';
  weekDropdown.appendChild(allOption);

  // Populate the dropdown menu with weeks
  weeks.forEach((week) => {
    const option = document.createElement('option');
    option.value = week;
    option.textContent = `Week: ${week}`;
    weekDropdown.appendChild(option);
  });
}

function updateYearDisplay(direction) {
  const yearDisplay = document.getElementById('year-display');
  const currentYear = parseInt(yearDisplay.textContent, 10);
  const years = JSON.parse(yearDisplay.dataset.years);

  const yearIndex = years.indexOf(currentYear);
  const newIndex = yearIndex - direction; // Invert the direction here

  console.log('Current year:', currentYear, 'Index:', yearIndex, 'New Index:', newIndex);

  if (newIndex >= 0 && newIndex < years.length) {
    const newYear = years[newIndex];
    console.log('New Year:', newYear);
    yearDisplay.textContent = newYear;
    const yearData = allData.filter((d) => d.season === newYear);
    updateScatterPlot(yearData);
  }
}

function updateWeekDisplay(direction) {
  const weekNumber = document.getElementById('week-number');
  const yearDisplay = document.getElementById('year-display');
  const currentYear = parseInt(yearDisplay.textContent, 10);
  const weekDisplay = document.getElementById('week-display');

  if (!weekDisplay.dataset.weeks) {
    console.error('Weeks data is undefined');
    return;
  }

  let currentWeek = weekNumber.textContent;
  const weeks = JSON.parse(weekDisplay.dataset.weeks);

  if (currentWeek === 'All' && direction !== 0) {
    currentWeek = direction === 1 ? weeks[0] : weeks[weeks.length - 1];
  } else if (currentWeek !== 'All') {
    currentWeek = parseInt(currentWeek, 10);
    const weekIndex = weeks.indexOf(currentWeek) + direction;

    if (weekIndex < 0 || weekIndex >= weeks.length) {
      currentWeek = 'All';
    } else {
      currentWeek = weeks[weekIndex];
    }
  }

  weekNumber.textContent = currentWeek === 'All' ? 'All' : currentWeek;
  document.getElementById('week-dropdown').value = currentWeek === 'All' ? 'all' : currentWeek;

  // Filter data based on year and week
  const filteredData = currentWeek === 'All'
      ? allData.filter((d) => d.season === currentYear) // All weeks for the selected year
      : allData.filter((d) => d.week === currentWeek && d.season === currentYear); // Specific week for the selected year

  updateScatterPlot(filteredData);
}

// ---------------------------//
//       EVENT LISTENERS      //
// ---------------------------//
function setupToggle(arrowId, isYearToggle, direction) {
  document.getElementById(arrowId).addEventListener('click', () => {
    if (isYearToggle) {
      console.log(`${arrowId} clicked`);
      updateYearDisplay(direction);
    } else {
      updateWeekDisplay(direction);
    }
  });
}

// Year toggles
setupToggle('left-arrow', true, -1);
setupToggle('right-arrow', true, 1);
// Week toggles
setupToggle('week-left-arrow', false, -1);
setupToggle('week-right-arrow', false, 1);


document.querySelector('.week-dropdown-arrow').addEventListener('click', () => {
  const dropdown = document.getElementById('week-dropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  console.log('Dropdown arrow clicked');
});

document.getElementById('week-dropdown').addEventListener('change', (event) => {
  const yearDisplay = document.getElementById('year-display');
  const currentYear = parseInt(yearDisplay.textContent, 10);

  if (event.target.value === 'all') {
    // Logic for 'All' selection
    const yearData = allData.filter((d) => d.season === currentYear); // Filter by the selected year
    updateScatterPlot(yearData);
  } else {
    const selectedWeek = parseInt(event.target.value, 10);
    const weekData = allData.filter((d) => d.week === selectedWeek && d.season === currentYear); // Filter by both week and year
    updateScatterPlot(weekData);
  }
});

document.addEventListener("DOMContentLoaded", function() {
  var toggleTextElements = d3.selectAll(".toggle-text");

  toggleTextElements
      .on("mouseover", function(event, d) {
        // Display the tooltip and set its content based on the element hovered.
        d3.select("#tooltip")
            .style("visibility", "visible")
            .text("Explanation about " + d3.select(this).text()); // Customize this text as needed

        // Position the tooltip near the mouse or the element.
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
      })
      .on("mousemove", function(event) {
        // Update the position of the tooltip as the mouse moves.
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", function() {
        // Hide the tooltip when the mouse leaves.
        d3.select("#tooltip").style("visibility", "hidden");
      });
});


function createScatterPlot(data) {
  // Validate data
  if (!Array.isArray(data) || !data.every((d) => 'pass_location' in d && 'pass_length'
      in d && 'air_yards' in d && 'desc' in d && d.air_yards > -20)) {
    return; // Exit the function if data is not valid
  }

  // // Log each data point to inspect
  // data.forEach((d) => {
  //   console.log(d.pass_location, d.air_yards);
  // });

  // Dimensions and margins for the graph
  const margin = {
    top: 15, right: 95, bottom: 35, left: 30,
  };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Append SVG object to the body of the page
  const svgScatter = d3.select('#plot-area')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // QB name label
  const firstItemDesc = data[0].desc;
  const passerPlayerName = extractPasserName(firstItemDesc);
  // Calculate completion percentage and total touchdowns
  const completions = data.filter((d) => d.yards_after_catch !== null && d.season_type === 'REG').length;
  const totalPasses = data.filter((d) => d.season_type === 'REG').length;
  const completionPercentage = ((completions / totalPasses) * 100).toFixed(2);

  // Call a function to display these stats
  displayStatLabels(completionPercentage, passerPlayerName);

  // Adding Y axis label
  svgScatter.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Air Yards');

  // Add a vertical line on the right side of the plot
  svgScatter.append('line')
      .attr('x1', width)
      .attr('y1', 0)
      .attr('x2', width)
      .attr('y2', height)
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);

  // Add X axis
  const x = d3.scalePoint()
      .range([0, width])
      .domain(['left', 'middle', 'right'])
      .padding(0.5);

  svgScatter.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('.tick text') // Select all text elements in the axis ticks
      .style('text-transform', 'capitalize') // Capitalize the first letter
      .style('font-size', '16px');

  // Find the minimum and maximum air_yards values in the data
  const minY = d3.min(data, (d) => d.air_yards);
  const maxY = d3.max(data, (d) => d.air_yards);

  // Define a jitter width
  const jitterWidth = 230;

  // Find the maximum YAC in your data
  const maxYAC = d3.max(data, (d) => d.yards_after_catch);

  // Define a linear scale for the YAC radius
  const radiusScale = d3.scaleLinear()
      .domain([0, maxYAC]) // From 0 to max YAC
      .range([3, 21]); // Radius range

  // Find the maximum EPA in your data
  const maxEPA = d3.max(data, (d) => d.qb_epa);

  // Define a linear scale for the EPA radius
  const radiusScaleEPA = d3.scaleLinear()
      .domain([0, maxEPA]) // From 0 to max EPA
      .range([3, 21]);

  // Find the maximum WPA in your data
  const maxWPA = d3.max(data, (d) => d.wpa);

  // Define a linear scale for the EPA radius
  const radiusScaleWPA = d3.scaleLinear()
      .domain([0, maxWPA]) // From 0 to max WPA
      .range([3, 21]);

  // Add Y axis
  const y = d3.scaleLinear()
      .domain([minY, maxY])
      .range([height, 0]);

  // ---------------------------//
  //         FIELD LINES        //
  // ---------------------------//
  // Y axis with all ticks
  const yAxis = svgScatter.append('g')
      .call(d3.axisLeft(y).ticks((maxY - minY) / 10))
      .attr('class', 'y-axis');

  // Modify existing grid lines
  yAxis.selectAll('.tick line')
      .attr('x2', width)
      .style('stroke', '#C9C9C9');

  // Style of Y-axis labels
  yAxis.selectAll('.tick text')
      .attr('transform', function () {
        // Get the current position of the text element
        const hashx = this.getAttribute('x') || 0;
        const hashy = this.getAttribute('y') || 2;
        return `translate(100, 0) rotate(90 ${hashx} ${hashy})`;
      })
      .style('text-anchor', 'middle')
      .style('fill', '#C9C9C9') // Set the color of the labels to gray
      .style('font-family', "'Clarendon Bold', serif")
      .style('font-weight', 'bold')
      .style('font-size', '35px')
      .style('letter-spacing', '5px');

  // Remove the zero tick label
  yAxis.select('.tick')
      .filter((d) => d === 0)
      .remove();

  // Remove the -10 tick label
  yAxis.select('.tick')
      .filter((d) => d === -10)
      .remove();

  svgScatter.append('g')
      .call((g) => g.selectAll('.tick line')
          .attr('x2', width) // Extend the tick lines across the width of the plot area
          .style('stroke', '#C9C9C9'))
      .call((g) => g.selectAll('.tick text')
          .style('text-anchor', 'start') // Align text to start (right side of the tick)
          .attr('dx', '1.5em') // Offset text horizontally to the right
          .attr('dy', '0.3em') // Offset text vertically to align with tick center
          .style('fill', 'rgba(0, 0, 0, 0.5)') // Semi-transparent (light gray)
          .style('font-size', '20px'));

  // Red dashed line for "L.O.S."
  svgScatter.append('line')
      .attr('x1', 0)
      .attr('y1', y(0))
      .attr('x2', width)
      .attr('y2', y(0))
      .attr('stroke', 'red')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '4');

  // Add "L.O.S." text in the center
  svgScatter.append('text')
      .attr('x', width / 2) // Center horizontally
      .attr('y', y(0) + 15) // Adjust vertically to avoid overlapping with the line
      .attr('fill', 'red')
      .style('font-size', '12px')
      .style('text-anchor', 'middle') // Center the text around the x position
      .text('L.O.S.');

  data.forEach((d) => {
    // Store the jitter value directly on the data object
    d.jitter = (Math.random() - 0.5) * jitterWidth;
  });

  // Define the capitalization function
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // ---------------------------//
  //         DOT HOVER          //
  // ---------------------------//
  const highlightDot = (event, d) => {
    const yacChecked = d3.select('#slider').property('checked');
    const epaChecked = d3.select('#slider2').property('checked');
    const wpaChecked = d3.select('#slider3').property('checked');

    let radius;
    if (yacChecked) {
      radius = radiusScale(d.yards_after_catch) * 1.1; // Slightly larger radius for YAC toggle
    } else if (epaChecked) {
      radius = radiusScaleEPA(d.qb_epa) * 1.1; // Slightly larger radius for EPA toggle
    } else if (wpaChecked) {
      radius = radiusScaleWPA(d.wpa) * 1.1; // Slightly larger radius for WPA toggle
    } else {
      radius = (d.yards_after_catch === null ? 5 : 5.5); // Default hover radius
    }

    d3.select(event.currentTarget)
        .transition()
        .duration(150)
        .attr('r', radius);
  };

  const unhighlightDot = (event, d) => {
    const yacChecked = d3.select('#slider').property('checked');
    const epaChecked = d3.select('#slider2').property('checked');
    const wpaChecked = d3.select('#slider3').property('checked');

    let radius;
    if (yacChecked) {
      radius = radiusScale(d.yards_after_catch); // Standard radius for YAC toggle
    } else if (epaChecked) {
      radius = radiusScaleEPA(d.qb_epa); // Standard radius for EPA toggle
    } else if (wpaChecked) {
      radius = radiusScaleWPA(d.wpa); // Standard radius for WPA toggle
    } else {
      radius = (d.yards_after_catch === null ? 3.5 : 4); // Default non-hover radius
    }

    d3.select(event.currentTarget)
        .transition()
        .duration(150)
        .attr('r', radius);
  };

  // ---------------------------//
  //          DOT SIZE          //
  // ---------------------------//
  // Add dots with jitter
  // Completion/incompletion dots
  svgScatter.append('g')
      .selectAll('dot')
      .data(data.filter((d) => d.pass_touchdown !== 1 && d.interception !== 1 && d.season_type === 'REG'))
      .enter()
      .append('circle')
      .attr('class', (d) => (d.yards_after_catch === null ? 'incomplete-pass' : 'complete-pass'))
      .attr('r', 4)
      .attr('cx', (d) => x(d.pass_location) + d.jitter)
      .attr('cy', (d) => y(d.air_yards));

  // TD and INT dots
  svgScatter.append('g')
      .selectAll('dot')
      .data(data.filter((d) => (d.pass_touchdown === 1 || d.interception === 1) && d.season_type === 'REG'))
      .enter()
      .append('circle')
      .attr('class', (d) => d.pass_touchdown === 1 ? 'td-dot' : 'int-dot') // Conditional class assignment
      .attr('r', 4)
      .attr('cx', (d) => x(d.pass_location) + (Math.random() - 0.5) * jitterWidth)
      .attr('cy', (d) => y(d.air_yards));


  // Bubble Plot Sliders
  if (d3.select('#slider').node() && d3.select('#slider').property('checked')) {
    drawYACBubbles();
  }

  if (d3.select('#slider2').node() && d3.select('#slider2').property('checked')) {
    drawEPABubbles();
  }

  if (d3.select('#slider3').node() && d3.select('#slider3').property('checked')) {
    drawWPABubbles();
  }

  // ---------------------------//
  //          TOOLTIPS          //
  // ---------------------------//
  function showTooltip(event, d) {
    const tooltipFields = buildTooltipFields(d);
    const tooltipContent = tooltipFields.join('<br>');
    const tooltip = d3.select('#tooltip');

    tooltip.html(tooltipContent).style('visibility', 'visible');

    positionTooltip(event, tooltip);
  }

  function hideTooltip() {
    d3.select('#tooltip').style('visibility', 'hidden');
  }

  function buildTooltipFields(d) {
    const fields = [
      `<strong>Week:</strong> ${d.week}`,
      `<strong>Quarter:</strong> ${d.qtr}`,
      `<strong>Opponent:</strong> ${d.defteam}<br>`,
      `<strong>Description:</strong><br>${d.desc}<br>`,
      `<strong>Pass Location:</strong> ${capitalizeFirstLetter(d.pass_location)}`,
      `<strong>Air Yards:</strong> ${d.air_yards}`,
    ];

    if (d.yards_after_catch !== null) {
      fields.push(`<strong>Yards After Catch:</strong> ${d.yards_after_catch}<br>`);
    } else {
      fields.push('<strong>Result:</strong> Incomplete Pass<br>');
    }

    fields.push(`<strong>WPA:</strong> ${parseFloat(d.wpa).toFixed(2)}`);
    fields.push(`<strong>EPA:</strong> ${parseFloat(d.qb_epa).toFixed(2)}`);

    return fields;
  }

  function positionTooltip(event, tooltip) {
    const {width: tooltipWidth, height: tooltipHeight} = tooltip.node().getBoundingClientRect();
    const containerRect = document.querySelector('#visualization-container').getBoundingClientRect();

    let left = event.pageX + 10; // Right of the cursor
    let top = event.pageY - tooltipHeight - 10; // Above the cursor

    if (event.clientX + tooltipWidth + 20 > window.innerWidth) {
      left = event.pageX - tooltipWidth - 10;
    }
    if (event.clientY - tooltipHeight < 0) {
      top = event.pageY + 20;
    }

    left = Math.max(containerRect.left + window.scrollX,
        Math.min(left, containerRect.right + window.scrollX - tooltipWidth));
    top = Math.max(containerRect.top + window.scrollY,
        Math.min(top, containerRect.bottom + window.scrollY - tooltipHeight));

    tooltip.style('left', `${left}px`).style('top', `${top}px`);
  }

  svgScatter.selectAll('circle')
      .on('mouseover', (event, d) => {
        highlightDot(event, d);
        showTooltip(event, d);
      })
      .on('mouseout', (event, d) => {
        unhighlightDot(event, d);
        hideTooltip();
      });

  // ---------------------------//
  //         STAT LABEL         //
  // ---------------------------//
  function extractPasserName(desc) {
    console.log('Description:', desc);

    // Adjusted regex to capture only the name, excluding the part before the hyphen
    const regex = /\d+-(\w+\.\w+)/;
    const matches = desc.match(regex);

    console.log('Matches:', matches);

    if (matches && matches.length > 1) {
      const name = matches[1].replace(/_/g, ' ');
      console.log('Extracted Name:', name);
      return name;
    }
    console.log('Name not found in:', desc);
    return 'Name not found';
  }

  function displayStatLabels(completionPercentage, passerPlayerName) {
    const svgScatter = d3.select('#plot-area').select('svg');
    const width = +svgScatter.attr('width');
    const margin = {
      top: 8, right: 120, bottom: 20, left: 30,
    };

    // Append text for player name
    svgScatter.append('text')
        .attr('x', width - margin.right) // Adjust position as needed
        .attr('y', margin.top)
        .style('text-anchor', 'end')
        .attr('class', 'pixel-font') // Add the pixel font class
        .text(`QB: ${passerPlayerName}`);

    // Append text for completion percentage
    svgScatter.append('text')
        .attr('x', width - margin.right) // Adjust position as needed
        .attr('y', margin.top + 11) // Adjust vertical position
        .style('text-anchor', 'end')
        .attr('class', 'pixel-font')
        .text(`Completion %: ${completionPercentage} (${completions}/${totalPasses})`);
  }

  // ---------------------------//
  //          LEGEND            //
  // ---------------------------//
  function createLegend() {
    // Select the second box where the legend elements will be placed
    const legendElements = d3.select('.legend-elements');

    // Clear previous legend items if any, but not the slider
    legendElements.selectAll('.legend-item-container:not(.cleanToggle)').remove();

    // Append or update the title to the legend-elements container
    const legendTitle = legendElements.selectAll('.legend-elements-title')
        .data(['Display']);

    legendTitle.enter()
        .append('div')
        .attr('class', 'legend-elements-title')
        .merge(legendTitle)
        .text((d) => d);

    // Function to create a legend item inside the "legend-elements" container
    function createLegendItem(color, text, className) {
      // Create a container for each legend item
      const legendItemContainer = legendElements.append('div')
          .attr('class', 'legend-item-container')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'flex-start') // Align items to the left
          .style('padding', '5px')
          .style('margin', '2px 0'); // Spacing between legend items

      // Create the LED light within the legend item container
      legendItemContainer.append('div')
          .attr('class', 'led-light')
          .style('width', '5px')
          .style('height', '5px')
          .style('border-radius', '50%') // Circular shape
          .style('background-color', '#090') // Base color for the LED
          .style('margin-right', '5px'); // Space between the LED and the dot

      // Append the SVG for the color symbol
      legendItemContainer.append('svg')
          .attr('width', 20)
          .attr('height', 20)
          .append('circle')
          .attr('cx', 10)
          .attr('cy', 10)
          .attr('r', 5)
          .attr('fill', color);

      // Append the text next to the symbol
      legendItemContainer.append('span')
          .attr('class', 'legend-text')
          .style('margin-left', '5px')
          .text(text);

      // ---------------------------//
      //         LED LIGHTS         //
      // ---------------------------//
      function updateLedStyle(led, isOn) {
        if (isOn) {
          // LED on
          led.style('background-color', '#0F0') // Bright green color for the LED
              .style('background-image', 'radial-gradient(circle at 30% 30%, white, #0F0 60%)') // Glossy effect
              .style('border', '1px solid #c9c9c9') // Gray border
              .style('box-shadow', '0 0 2px #0F0, 0 0 4px #0F0, 0 0 8px #0F0, 0 0 0 1px #C9C9C9'); // Glow with gray line
        } else {
          // LED off
          led.style('background-color', '#474f47') // Gray color for the LED
              .style('background-image', 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), '
                  + 'rgba(71, 79, 71, 0.5) 60%, rgba(71, 79, 71, 0.7))')
              .style('border', '1px solid #c9c9c9') // Maintain the gray border
              .style('box-shadow', '0 0 0 1px #C9C9C9'); // No glow effect
        }
      }

      legendItemContainer.on('click', function (event) {
        // Existing code to stop event propagation and toggle dot visibility
        event.stopPropagation();

        const dots = d3.selectAll(`.${className}`);
        const isVisible = dots.style('visibility') === 'visible';
        dots.style('visibility', isVisible ? 'hidden' : 'visible');

        // Update the LED light style
        const led = d3.select(this).select('.led-light');
        updateLedStyle(led, !isVisible);

        // Call toggleYACLines to update the slider's opacity
        toggleYACBubbles();
        toggleEPABubbles();
        toggleWPABubbles();
      });
    }

    // ---------------------------//
    //         DOT COLORS         //
    // ---------------------------//
    // Create legend items inside the "legend-elements" container
    createLegendItem('#348fea', 'Completions', 'complete-pass');
    createLegendItem('#C9C9C9', 'Incompletions', 'incomplete-pass');
    createLegendItem('#2cc526', 'Touchdowns', 'td-dot');
    createLegendItem('#DE0909', 'Interceptions', 'int-dot');

    // ---------------------------//
    //        BUBBLE TOGGLES      //
    // ---------------------------//
    // Check if the toggle already exists in the new location
    let toggle = d3.select('.legend-box-bubble').select('.cleanToggle');
    if (toggle.empty()) {
      // If the toggle is not found, create it in the new location
      toggle = d3.select('.legend-box-bubble').append('div')
          .attr('class', 'cleanToggle');

      // Append the checkbox, initially not checked (which means "off")
      toggle.append('input')
          .attr('type', 'checkbox')
          .attr('id', 'slider')
          .property('checked', false); // Start with the toggle in the "off" state

      // Append the label for the checkbox
      toggle.append('label')
          .attr('for', 'slider')
          .attr('class', 'slider-label')
          .attr('data-on', 'ON')
          .attr('data-off', 'OFF');
    }

    // Now move the entire container, not just the toggle
    legendElements.selectAll('.toggle-container').raise();

    // Event listener for changes in the slider
    d3.select('#slider').on('change', toggleYACBubbles);

    // Check if the toggle already exists in the new location
    let toggle2 = d3.select('.legend-box-bubble').select('.cleanToggle2');
    if (toggle2.empty()) {
      // If the toggle is not found, create it in the new location
      // Append the toggle
      toggle2 = d3.select('.legend-box-bubble').append('div')
          .attr('class', 'cleanToggle2');

      // Append the checkbox, initially not checked (which means "off")
      toggle2.append('input')
          .attr('type', 'checkbox')
          .attr('id', 'slider2')
          .property('checked', false); // Start with the toggle in the "off" state

      // Append the label for the checkbox
      toggle2.append('label')
          .attr('for', 'slider2')
          .attr('class', 'slider-label')
          .attr('data-on', 'ON')
          .attr('data-off', 'OFF');
    }

    // Now move the entire container, not just the toggle
    legendElements.selectAll('.toggle-container').raise();

    // Event listener for changes in the slider
    d3.select('#slider2').on('change', toggleEPABubbles);

    // Check if the toggle already exists in the new location
    let toggle3 = d3.select('.legend-box-bubble').select('.cleanToggle3');
    if (toggle3.empty()) {
      // If the toggle is not found, create it in the new location
      toggle3 = d3.select('.legend-box-bubble').append('div')
          .attr('class', 'cleanToggle3');

      // Append the checkbox, initially not checked (which means "off")
      toggle3.append('input')
          .attr('type', 'checkbox')
          .attr('id', 'slider3')
          .property('checked', false); // Start with the toggle in the "off" state

      // Append the label for the checkbox
      toggle3.append('label')
          .attr('for', 'slider3')
          .attr('class', 'slider-label')
          .attr('data-on', 'ON')
          .attr('data-off', 'OFF');
    }

    // Now move the entire container, not just the toggle
    legendElements.selectAll('.toggle-container').raise();

    // Event listener for changes in the slider
    d3.select('#slider3').on('change', toggleWPABubbles);
  }

  // ---------------------------//
  //         YAC BUBBLES        //
  // ---------------------------//
  function toggleYACBubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    // Check if elements exist before accessing their style
    const completions = svgScatter.selectAll('.complete-pass');
    const touchdowns = svgScatter.selectAll('.td-dot');
    const areCompletionsDisabled = completions.empty() ? false : completions.style('visibility') === 'hidden';
    const areTouchdownsDisabled = touchdowns.empty() ? false : touchdowns.style('visibility') === 'hidden';

    const slider = d3.select('#slider');
    const isChecked = slider.property('checked');
    const sliderContainer = slider.node().parentNode;

    // Turn off other toggles when this one is turned on
    if (isChecked) {
      d3.select('#slider2').property('checked', false); // Turn off EPA
      d3.select('#slider3').property('checked', false); // Turn off WPA
    }

    // Handle the visibility and state of the toggle
    if (areCompletionsDisabled && areTouchdownsDisabled) {
      slider.property('checked', false);
      d3.select(sliderContainer)
          .style('opacity', 0.5)
          .style('pointer-events', 'none');
    } else {
      d3.select(sliderContainer)
          .style('opacity', 1)
          .style('pointer-events', 'all');

      if (isChecked) {
        drawYACBubbles(); // Expand bubbles
      } else {
        removeYACBubbles(); // Reset bubbles to original size
      }
    }
  }

  function drawYACBubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', (d) => radiusScale(d.yards_after_catch)) // Apply YAC-based scaling
        .style('opacity', 0.5); // Set the opacity to 50%
  }

  // Function to remove YAC bubbles
  function removeYACBubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', 4) // Reset to standard size
        .style('opacity', 1); // Reset opacity to fully opaque
  }

  // Single change event handler for the slider
  d3.select('#slider').on('change', function () {
    const isChecked = d3.select(this).property('checked');
    console.log('Slider change event triggered. isChecked:', isChecked);

    const svgScatterslideryac = d3.select('#plot-area').select('svg');

    // Log the count of completion and touchdown dots
    console.log('Number of completions:', svgScatterslideryac.selectAll('.complete-pass').size());
    console.log('Number of touchdowns:', svgScatterslideryac.selectAll('.td-dot').size());

    toggleYACBubbles();
  });

  // ---------------------------//
  //         EPA BUBBLES        //
  // ---------------------------//
  function toggleEPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    // Check if elements exist before accessing their style
    const completions = svgScatter.selectAll('.complete-pass');
    const touchdowns = svgScatter.selectAll('.td-dot');
    const areCompletionsDisabled = completions.empty() ? false : completions.style('visibility') === 'hidden';
    const areTouchdownsDisabled = touchdowns.empty() ? false : touchdowns.style('visibility') === 'hidden';

    const slider = d3.select('#slider2');
    const isChecked = slider.property('checked');
    const sliderContainer = slider.node().parentNode;

    // Turn off other toggles when this one is turned on
    if (isChecked) {
      d3.select('#slider').property('checked', false); // Turn off YAC
      d3.select('#slider3').property('checked', false); // Turn off WPA
    }

    // Handle the visibility and state of the toggle
    if (areCompletionsDisabled && areTouchdownsDisabled) {
      slider.property('checked', false);
      d3.select(sliderContainer)
          .style('opacity', 0.5)
          .style('pointer-events', 'none');
    } else {
      d3.select(sliderContainer)
          .style('opacity', 1)
          .style('pointer-events', 'all');

      if (isChecked) {
        drawEPABubbles(); // Expand bubbles
      } else {
        removeEPABubbles(); // Reset bubbles to original size
      }
    }
  }

  function drawEPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', (d) => radiusScaleEPA(d.qb_epa)) // Apply EPA-based scaling
        .style('opacity', 0.5); // Set the opacity to 50%
  }

  // Function to remove EPA bubbles
  function removeEPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', 4) // Reset to standard size
        .style('opacity', 1); // Reset opacity to fully opaque
  }

  // Single change event handler for the slider
  d3.select('#slider2').on('change', function () {
    const isChecked = d3.select(this).property('checked');
    console.log('Slider change event triggered. isChecked:', isChecked);

    const svgScattersliderepa = d3.select('#plot-area').select('svg');

    // Log the count of completion and touchdown dots
    console.log('Number of completions:', svgScattersliderepa.selectAll('.complete-pass').size());
    console.log('Number of touchdowns:', svgScattersliderepa.selectAll('.td-dot').size());

    toggleEPABubbles();
  });

  // ---------------------------//
  //         WPA BUBBLES        //
  // ---------------------------//
  function toggleWPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    // Check if elements exist before accessing their style
    const completions = svgScatter.selectAll('.complete-pass');
    const touchdowns = svgScatter.selectAll('.td-dot');
    const areCompletionsDisabled = completions.empty() ? false : completions.style('visibility') === 'hidden';
    const areTouchdownsDisabled = touchdowns.empty() ? false : touchdowns.style('visibility') === 'hidden';

    const slider = d3.select('#slider3');
    const isChecked = slider.property('checked');
    const sliderContainer = slider.node().parentNode;

    // Turn off other toggles when this one is turned on
    if (isChecked) {
      d3.select('#slider').property('checked', false); // Turn off YAC
      d3.select('#slider2').property('checked', false); // Turn off EPA
    }

    // Handle the visibility and state of the toggle
    if (areCompletionsDisabled && areTouchdownsDisabled) {
      slider.property('checked', false);
      d3.select(sliderContainer)
          .style('opacity', 0.5)
          .style('pointer-events', 'none');
    } else {
      d3.select(sliderContainer)
          .style('opacity', 1)
          .style('pointer-events', 'all');

      if (isChecked) {
        drawWPABubbles(); // Expand bubbles
      } else {
        removeWPABubbles(); // Reset bubbles to original size
      }
    }
  }

  function drawWPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', (d) => radiusScaleWPA(d.wpa)) // Apply WPA-based scaling
        .style('opacity', 0.5); // Set the opacity to 50%
  }

  // Function to remove WPA bubbles
  function removeWPABubbles() {
    const svgScatter = d3.select('#plot-area').select('svg');

    svgScatter.selectAll('.complete-pass, .td-dot')
        .transition()
        .duration(500) // Smooth transition
        .attr('r', 4) // Reset to standard size
        .style('opacity', 1); // Reset opacity to fully opaque
  }

  // Single change event handler for the slider
  d3.select('#slider3').on('change', function () {
    const isChecked = d3.select(this).property('checked');
    console.log('Slider change event triggered. isChecked:', isChecked);

    const svgScatterslideryac = d3.select('#plot-area').select('svg');

    // Log the count of completion and touchdown dots
    console.log('Number of completions:', svgScatterslideryac.selectAll('.complete-pass').size());
    console.log('Number of touchdowns:', svgScatterslideryac.selectAll('.td-dot').size());

    toggleWPABubbles();
  });

  // ---------------------------//
  //         FIELD LINES        //
  // ---------------------------//
  function addHashMarks(side) {
    const hashGroup = svgScatter.append('g');

    for (let i = minY; i <= maxY; i += 1) { // Updated here
      // Skip every 10th mark and also skip the first mark (i === minY)
      if (i % 10 !== 0 && i !== minY) {
        hashGroup.append('line')
            .attr('x1', side === 'left' ? 0 : width - 10)
            .attr('y1', y(i))
            .attr('x2', side === 'left' ? 10 : width)
            .attr('y2', y(i))
            .attr('stroke', '#C9C9C9')
            .attr('stroke-width', 1);
      }
    }
  }

  // Add hash marks to both sides
  addHashMarks('left');
  addHashMarks('right');

  // Function to add a vertical line with hash marks
  function addVerticalLineWithHashMarks(xPosition) {
    const lineGroup = svgScatter.append('g');

    // Add the vertical line
    lineGroup.append('line')
        .attr('x1', xPosition)
        .attr('y1', 0)
        .attr('x2', xPosition)
        .attr('y2', height)
        .attr('stroke', '#C9C9C9')
        .attr('stroke-width', 1);

    // Add hash marks, skipping every 10th mark and also the first mark (i === minY)
    for (let i = minY; i <= maxY; i += 1) {
      if (i % 10 !== 0 && i !== minY) {
        lineGroup.append('line')
            .attr('x1', xPosition - 5)
            .attr('y1', y(i))
            .attr('x2', xPosition + 5)
            .attr('y2', y(i))
            .attr('stroke', '#C9C9C9')
            .attr('stroke-width', 1);
      }
    }
  }

  // Calculate positions for 1/3rd and 2/3rds
  const oneThirdX = width / 3;
  const twoThirdsX = (2 * width) / 3;

  // Add vertical lines with hash marks
  addVerticalLineWithHashMarks(oneThirdX);
  addVerticalLineWithHashMarks(twoThirdsX);

  // Call this function after your createScatterPlot function or at the end of your script
  createLegend();
}