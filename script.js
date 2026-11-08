
// ==========================================
// INTERACTIVE CALCULATOR & UNIT CONVERTER
// ==========================================


// 1. NAVIGATION BETWEEN SECTIONS

function showSection(sectionName) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionName).classList.add("active");
}


// ==========================================
// 2. CALCULATOR FUNCTIONS
// ==========================================

const display = document.getElementById("display");

function appendValue(value) {
    if (display.value === "Error") {
        display.value = "";
    }

    display.value += value;
}

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}


// Safe mathematical expression parser.
// Supports +, -, *, /, decimals and percentages.

function evaluateExpression(expression) {
    const tokens = expression.match(
        /\d*\.?\d+|[+\-*/%]/g
    );

    if (!tokens || tokens.join("") !== expression) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseExpression() {
        let result = parseTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            const operator = tokens[position++];

            const next = parseTerm();

            result = operator === "+"
                ? result + next
                : result - next;
        }

        return result;
    }

    function parseTerm() {
        let result = parseFactor();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {
            const operator = tokens[position++];

            const next = parseFactor();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = operator === "*"
                ? result * next
                : result / next;
        }

        return result;
    }

    function parseFactor() {
        let sign = 1;

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            if (tokens[position] === "-") {
                sign *= -1;
            }

            position++;
        }

        const token = tokens[position++];

        if (
            !token ||
            !/^\d*\.?\d+$/.test(token)
        ) {
            throw new Error("Invalid number");
        }

        let number = Number(token) * sign;

        if (tokens[position] === "%") {
            number /= 100;
            position++;
        }

        return number;
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}


function calculateResult() {
    try {
        if (!display.value.trim()) {
            return;
        }

        const result = evaluateExpression(display.value);

        display.value = Number(result.toPrecision(12)).toString();

    } catch (error) {
        display.value = "Error";
    }
}


// ==========================================
// 3. UNIT CONVERTER DATA
// ==========================================

const units = {

    length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Mile: 1609.344,
        Foot: 0.3048,
        Inch: 0.0254
    },

    weight: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        Pound: 0.45359237,
        Ounce: 0.028349523125,
        Tonne: 1000
    },

    time: {
        Second: 1,
        Minute: 60,
        Hour: 3600,
        Day: 86400,
        Week: 604800
    },

    data: {
        Byte: 1,
        KB: 1000,
        MB: 1000000,
        GB: 1000000000,
        TB: 1000000000000
    },

    speed: {
        "Meter/Second": 1,
        "Kilometer/Hour": 1 / 3.6,
        "Mile/Hour": 0.44704,
        "Foot/Second": 0.3048
    },

    temperature: {
        Celsius: "C",
        Fahrenheit: "F",
        Kelvin: "K"
    }
};


// ==========================================
// 4. UPDATE UNIT OPTIONS
// ==========================================

function updateUnits() {

    const category = document.getElementById("category").value;

    const fromUnit = document.getElementById("fromUnit");
    const toUnit = document.getElementById("toUnit");

    const categoryUnits = units[category];

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    Object.keys(categoryUnits).forEach(unit => {

        const option1 = document.createElement("option");
        option1.value = unit;
        option1.textContent = unit;

        const option2 = document.createElement("option");
        option2.value = unit;
        option2.textContent = unit;

        fromUnit.appendChild(option1);
        toUnit.appendChild(option2);

    });

    // Set different default units

    if (toUnit.options.length > 1) {
        toUnit.selectedIndex = 1;
    }

    convertUnit();
}


// ==========================================
// 5. TEMPERATURE CONVERSION
// ==========================================

function convertTemperature(value, from, to) {

    let celsius;

    // Convert input into Celsius

    if (from === "Celsius") {
        celsius = value;
    }
    else if (from === "Fahrenheit") {
        celsius = (value - 32) * 5 / 9;
    }
    else if (from === "Kelvin") {
        celsius = value - 273.15;
    }

    // Convert Celsius into target unit

    if (to === "Celsius") {
        return celsius;
    }

    if (to === "Fahrenheit") {
        return (celsius * 9 / 5) + 32;
    }

    if (to === "Kelvin") {
        return celsius + 273.15;
    }
}


// ==========================================
// 6. MAIN UNIT CONVERSION FUNCTION
// ==========================================

function convertUnit() {

    const category = document.getElementById("category").value;

    const inputValue = document.getElementById("inputValue").value;

    const fromUnit = document.getElementById("fromUnit").value;

    const toUnit = document.getElementById("toUnit").value;

    const resultElement = document.getElementById("conversionResult");

    if (inputValue.trim() === "") {
        resultElement.textContent = "Please enter a value";
        return;
    }

    const value = Number(inputValue);

    if (!Number.isFinite(value)) {
        resultElement.textContent = "Please enter a valid number";
        return;
    }

    let result;

    try {

        if (category === "temperature") {

            result = convertTemperature(
                value,
                fromUnit,
                toUnit
            );

            // Kelvin cannot be below absolute zero

            if (
                (fromUnit === "Kelvin" && value < 0) ||
                (fromUnit === "Celsius" && value < -273.15) ||
                (fromUnit === "Fahrenheit" && value < -459.67)
            ) {
                throw new Error("Temperature below absolute zero");
            }

        } else {

            const baseValue = value * units[category][fromUnit];

            result = baseValue / units[category][toUnit];

        }

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        resultElement.textContent =
            `${value} ${fromUnit} = ${Number(result.toPrecision(10))} ${toUnit}`;

    } catch (error) {

        resultElement.textContent = error.message;

    }
}


// ==========================================
// 7. KEYBOARD SUPPORT
// ==========================================

document.addEventListener("keydown", function(event) {

    const allowedKeys = "0123456789.+-*/%";

    if (allowedKeys.includes(event.key)) {

        appendValue(event.key);

    }
    else if (event.key === "Enter") {

        event.preventDefault();
        calculateResult();

    }
    else if (event.key === "Backspace") {

        deleteLast();

    }
    else if (event.key === "Escape") {

        clearDisplay();

    }

});


// ==========================================
// 8. INITIALIZE APPLICATION
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    updateUnits();

    showSection("calculator");

    console.log(
        "Interactive Calculator & Unit Converter is Ready!"
    );

});
