// ==========================================
// API URLs
// ==========================================

let chartDataURL =
    "https://stock-market-api-k9vl.onrender.com/api/stocksdata";

let statsDataURL =
    "https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata";

let profileDataURL =
    "https://stock-market-api-k9vl.onrender.com/api/profiledata";


// ==========================================
// GLOBAL STATE
// ==========================================

let selectedStock = "NVDA";

let selectedRange = "5y";

let chartData = [];

let stockChart = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

let chartCanvas =
    document.getElementById("stockChart");

let chartStockName =
    document.getElementById("chartStockName");

let chartRangeText =
    document.getElementById("chartRangeText");

let stockNameElement =
    document.getElementById("stockName");

let bookValueElement =
    document.getElementById("bookValue");

let profitElement =
    document.getElementById("profit");

let profitBadge =
    document.getElementById("profitBadge");

let summaryElement =
    document.getElementById("summary");

let peakValueElement =
    document.getElementById("peakValue");

let lowestValueElement =
    document.getElementById("lowestValue");

let stockListElement =
    document.getElementById("stockList");


// ==========================================
// RANGE NAMES
// ==========================================

let rangeNames = {

    "1mo": "1 Month",

    "3mo": "3 Months",

    "1y": "1 Year",

    "5y": "5 Years"

};


// ==========================================
// CREATE CHART DATA
// ==========================================

function createChartData(stock, range) {

    chartData = [];


    return fetch(chartDataURL)

        .then(function(response) {

            if (!response.ok) {
                throw new Error("Chart API request failed");
            }

            return response.json();

        })

        .then(function(data) {

            let stockData =
                data.stocksData[0][stock][range];


            let timeStamp =
                stockData.timeStamp;


            let value =
                stockData.value;


            value.forEach(function(price, index) {

                let date =
                    new Date(
                        timeStamp[index] * 1000
                    ).toLocaleDateString();


                chartData.push({

                    date: date,

                    price: price

                });

            });


            return chartData;

        });

}



// ==========================================
// RENDER CHART
// ==========================================

function renderChart() {

    let labels =
        chartData.map(function(item) {

            return item.date;

        });


    let prices =
        chartData.map(function(item) {

            return item.price;

        });


    // Find peak and lowest
    let peak =
        Math.max(...prices);


    let lowest =
        Math.min(...prices);


    peakValueElement.textContent =
        peak.toFixed(2);


    lowestValueElement.textContent =
        lowest.toFixed(2);


    // Destroy previous chart
    if (stockChart) {

        stockChart.destroy();

    }


    // Create new chart
    stockChart = new Chart(chartCanvas, {

        type: "line",


        data: {

            labels: labels,


            datasets: [{

                label: selectedStock,

                data: prices,

                tension: 0.25,

                borderWidth: 2,

                pointRadius: 2,

                pointHoverRadius: 6

            }]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            interaction: {

                mode: "index",

                intersect: false

            },


            plugins: {

                legend: {

                    display: false

                },


                tooltip: {

                    callbacks: {

                        title: function(context) {

                            return context[0].label;

                        },


                        label: function(context) {

                            return (
                                selectedStock +
                                ": $" +
                                context.parsed.y.toFixed(2)
                            );

                        }

                    }

                }

            },


            scales: {

                x: {

                    ticks: {

                        maxTicksLimit: 10

                    }

                },


                y: {

                    beginAtZero: false

                }

            }

        }

    });

}



// ==========================================
// LOAD CHART
// ==========================================

function loadChart() {

    return createChartData(
        selectedStock,
        selectedRange
    )
        .then(function(data) {

            chartData = data;

            renderChart();

        })
        .catch(function(error) {

            console.error(
                "Chart Error:",
                error
            );

        });

}



// ==========================================
// GET STOCK STATS
// ==========================================

function getStockStats(stock) {

    return fetch(statsDataURL)

        .then(function(response) {

            if (!response.ok) {
                throw new Error("Stats API request failed");
            }

            return response.json();

        })

        .then(function(data) {

            let stockStats =
                data.stocksStatsData[0][stock];


            let bookValue =
                stockStats.bookValue;


            let profit =
                stockStats.profit;


            // Display stock name
            stockNameElement.textContent =
                stock;


            chartStockName.textContent =
                stock;


            // Display book value
            bookValueElement.textContent =
                "$ " + bookValue.toFixed(3);


            // Display profit
            profitElement.textContent =
                (profit * 100).toFixed(2) + "%";


            // Positive / Negative
            if (profit > 0) {

                profitElement.style.color =
                    "#16a34a";

                profitBadge.style.color =
                    "#16a34a";

                profitBadge.textContent =
                    "Profit";

            } else {

                profitElement.style.color =
                    "#dc2626";

                profitBadge.style.color =
                    "#dc2626";

                profitBadge.textContent =
                    "No Profit";

            }


            return stockStats;

        })

        .catch(function(error) {

            console.error(
                "Stats Error:",
                error
            );

        });

}



// ==========================================
// GET STOCK SUMMARY
// ==========================================

function getStockProfile(stock) {

    return fetch(profileDataURL)

        .then(function(response) {

            if (!response.ok) {
                throw new Error(
                    "Profile API request failed"
                );
            }

            return response.json();

        })

        .then(function(data) {

            let profile =
                data.stocksProfileData[0][stock];


            summaryElement.textContent =
                profile.summary;


            return profile;

        })

        .catch(function(error) {

            console.error(
                "Profile Error:",
                error
            );

            summaryElement.textContent =
                "Unable to load company summary.";

        });

}



// ==========================================
// LOAD ALL STOCK INFORMATION
// ==========================================

function loadStock(stock) {

    selectedStock = stock;


    // Update active stock button
    updateActiveStockButton();


    // Update chart
    loadChart();


    // Update stats
    getStockStats(selectedStock);


    // Update profile
    getStockProfile(selectedStock);

}



// ==========================================
// UPDATE CHART RANGE
// ==========================================

function updateRange(range) {

    selectedRange = range;


    // Update active range button
    updateActiveRangeButton();


    // Update range text
    chartRangeText.textContent =
        rangeNames[range];


    // Reload chart
    loadChart();

}



// ==========================================
// ACTIVE STOCK BUTTON
// ==========================================

function updateActiveStockButton() {

    let buttons =
        document.querySelectorAll(".stock-btn");


    buttons.forEach(function(button) {

        if (
            button.dataset.stock ===
            selectedStock
        ) {

            button.classList.add("active");

        } else {

            button.classList.remove("active");

        }

    });

}



// ==========================================
// ACTIVE RANGE BUTTON
// ==========================================

function updateActiveRangeButton() {

    let buttons =
        document.querySelectorAll(".range-btn");


    buttons.forEach(function(button) {

        button.classList.remove("active");

    });


    if (selectedRange === "1mo") {

        document
            .getElementById("oneMonth")
            .classList.add("active");

    }


    if (selectedRange === "3mo") {

        document
            .getElementById("threeMonth")
            .classList.add("active");

    }


    if (selectedRange === "1y") {

        document
            .getElementById("oneYear")
            .classList.add("active");

    }


    if (selectedRange === "5y") {

        document
            .getElementById("fiveYear")
            .classList.add("active");

    }

}



// ==========================================
// CREATE STOCK LIST
// ==========================================

function createStockList() {

    return fetch(statsDataURL)

        .then(function(response) {

            if (!response.ok) {
                throw new Error(
                    "Stock stats request failed"
                );
            }

            return response.json();

        })

        .then(function(data) {

            let stocks =
                data.stocksStatsData[0];


            let stockNames = Object.keys(stocks)
                .filter(function(stock) {

                    return stock !== "_id";

                });


            stockListElement.innerHTML = "";


            stockNames.forEach(function(stock) {

                let stockButton =
                    document.createElement("button");


                stockButton.classList.add(
                    "stock-btn"
                );


                stockButton.dataset.stock =
                    stock;


                let symbolSpan =
                    document.createElement("span");


                symbolSpan.classList.add(
                    "stock-symbol"
                );


                symbolSpan.textContent =
                    stock;


                let profitSpan =
                    document.createElement("span");


                profitSpan.classList.add(
                    "stock-profit"
                );


                let profit =
                    stocks[stock].profit;


                profitSpan.textContent =
                    (profit * 100).toFixed(2) + "%";


                if (profit > 0) {

                    profitSpan.classList.add(
                        "positive"
                    );

                } else {

                    profitSpan.classList.add(
                        "negative"
                    );

                }


                stockButton.appendChild(
                    symbolSpan
                );


                stockButton.appendChild(
                    profitSpan
                );


                stockButton.addEventListener(
                    "click",
                    function() {

                        loadStock(stock);

                    }
                );


                stockListElement.appendChild(
                    stockButton
                );

            });


            updateActiveStockButton();

        })

        .catch(function(error) {

            console.error(
                "Stock List Error:",
                error
            );

        });

}



// ==========================================
// RANGE BUTTON EVENTS
// ==========================================

document
    .getElementById("oneMonth")
    .addEventListener(
        "click",
        function() {

            updateRange("1mo");

        }
    );


document
    .getElementById("threeMonth")
    .addEventListener(
        "click",
        function() {

            updateRange("3mo");

        }
    );


document
    .getElementById("oneYear")
    .addEventListener(
        "click",
        function() {

            updateRange("1y");

        }
    );


document
    .getElementById("fiveYear")
    .addEventListener(
        "click",
        function() {

            updateRange("5y");

        }
    );



// ==========================================
// INITIAL LOAD
// ==========================================

function initializeApp() {

    chartRangeText.textContent =
        rangeNames[selectedRange];


    createStockList();


    loadChart();


    getStockStats(selectedStock);


    getStockProfile(selectedStock);


    updateActiveRangeButton();

}



// Start application
initializeApp();