import { useState } from "react";
import { Link } from "react-router-dom";

const devices = [
  "iPhone",
  "Samsung",
  "Google Pixel",
  "Xiaomi",
  "Redmi",
  "OnePlus",
  "Motorola",
  "Huawei",
  "Oppo",
  "Vivo",
  "Realme",
  "Mobilador",
];

const deviceModels = {
  iPhone: [
    "iPhone 11",
    "iPhone 11 Pro",
    "iPhone 12",
    "iPhone 12 Pro",
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 14",
    "iPhone 14 Pro",
    "iPhone 15",
    "iPhone 15 Pro",
    "iPhone 16",
    "iPhone 16 Pro",
    "Other iPhone",
  ],

  Samsung: [
    "Galaxy S21",
    "Galaxy S22",
    "Galaxy S23",
    "Galaxy S24",
    "Galaxy S25",
    "Galaxy A15",
    "Galaxy A25",
    "Galaxy A35",
    "Galaxy A55",
    "Other Samsung",
  ],

  "Google Pixel": [
    "Pixel 6",
    "Pixel 7",
    "Pixel 8",
    "Pixel 9",
    "Other Pixel",
  ],

  Xiaomi: [
    "Xiaomi 12",
    "Xiaomi 13",
    "Xiaomi 14",
    "Other Xiaomi",
  ],

  Redmi: [
    "Redmi Note 11",
    "Redmi Note 12",
    "Redmi Note 13",
    "Redmi Note 14",
    "Other Redmi",
  ],

  OnePlus: [
    "OnePlus 10",
    "OnePlus 11",
    "OnePlus 12",
    "OnePlus 13",
    "Other OnePlus",
  ],

  Motorola: [
    "Moto G",
    "Moto G Power",
    "Moto Edge",
    "Other Motorola",
  ],

  Huawei: [
    "Huawei P Series",
    "Huawei Mate Series",
    "Huawei Nova Series",
    "Other Huawei",
  ],

  Oppo: [
    "Oppo Reno",
    "Oppo Find",
    "Oppo A Series",
    "Other Oppo",
  ],

  Vivo: [
    "Vivo V Series",
    "Vivo Y Series",
    "Vivo X Series",
    "Other Vivo",
  ],

  Realme: [
    "Realme GT",
    "Realme C Series",
    "Realme Number Series",
    "Other Realme",
  ],

  Mobilador: [
    "Standard Mobilador",
    "High Performance Mobilador",
    "Other Mobilador",
  ],
};

const playStyles = [
  "Rusher",
  "SMG",
  "Sniper",
  "Balanced",
  "One-Tap",
];

function getDailyUsage() {
  const saved = localStorage.getItem("bolox_generations");

  if (!saved) {
    return 0;
  }

  try {
    const data = JSON.parse(saved);
    const today = new Date().toDateString();

    if (data.date !== today) {
      localStorage.removeItem("bolox_generations");
      return 0;
    }

    return data.count || 0;
  } catch {
    localStorage.removeItem("bolox_generations");
    return 0;
  }
}

function generateSettings(style, device, model) {
  const presets = {
    Rusher: {
      General: 195,
      "Red Dot": 185,
      "2X Scope": 175,
      "4X Scope": 155,
      "Sniper Scope": 90,
      "Free Look": 185,
    },

    SMG: {
      General: 192,
      "Red Dot": 188,
      "2X Scope": 178,
      "4X Scope": 158,
      "Sniper Scope": 92,
      "Free Look": 182,
    },

    Sniper: {
      General: 170,
      "Red Dot": 155,
      "2X Scope": 145,
      "4X Scope": 125,
      "Sniper Scope": 82,
      "Free Look": 165,
    },

    Balanced: {
      General: 185,
      "Red Dot": 175,
      "2X Scope": 165,
      "4X Scope": 148,
      "Sniper Scope": 88,
      "Free Look": 178,
    },

    "One-Tap": {
      General: 198,
      "Red Dot": 190,
      "2X Scope": 180,
      "4X Scope": 160,
      "Sniper Scope": 95,
      "Free Look": 188,
    },
  };

  const settings = { ...presets[style] };

  const deviceAdjustments = {
    iPhone: -3,
    Samsung: 0,
    "Google Pixel": -2,
    Xiaomi: 2,
    Redmi: 4,
    OnePlus: -1,
    Motorola: 3,
    Huawei: 1,
    Oppo: 2,
    Vivo: 2,
    Realme: 3,
    Mobilador: 5,
  };

  const deviceAdjustment =
    deviceAdjustments[device] || 0;

  let modelAdjustment = 0;

  const performanceModels = [
    "Pro",
    "S23",
    "S24",
    "S25",
    "Pixel 8",
    "Pixel 9",
    "Xiaomi 13",
    "Xiaomi 14",
    "OnePlus 12",
    "OnePlus 13",
    "GT",
    "High Performance",
  ];

  if (
    performanceModels.some((name) =>
      model.includes(name)
    )
  ) {
    modelAdjustment = -2;
  }

  Object.keys(settings).forEach((key) => {
    settings[key] = Math.max(
      0,
      Math.min(
        200,
        settings[key] +
          deviceAdjustment +
          modelAdjustment
      )
    );
  });

  return settings;
}

function SensitivityGenerator() {
  const [device, setDevice] = useState("");
  const [model, setModel] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generations, setGenerations] = useState(getDailyUsage);

  const remaining = Math.max(0, 5 - generations);

  const handleGenerate = () => {
    setError("");
    setCopied(false);

    if (!device || !model || !style) {
      setError(
        "Select your device, phone model, and play style first."
      );
      return;
    }

    if (generations >= 5) {
      setError(
        "You've reached your 5 free generations for today."
      );
      return;
    }

    const settings = generateSettings(
      style,
      device,
      model
    );

    setResult({
      device,
      model,
      style,
      settings,
    });

    const newCount = generations + 1;

    setGenerations(newCount);

    localStorage.setItem(
      "bolox_generations",
      JSON.stringify({
        date: new Date().toDateString(),
        count: newCount,
      })
    );
  };

  const handleCopy = async () => {
    if (!result) return;

    const text = [
      "BOLOX Free Fire Sensitivity",
      `Device: ${result.device}`,
      `Model: ${result.model}`,
      `Play Style: ${result.style}`,
      "",
      ...Object.entries(result.settings).map(
        ([name, value]) => `${name}: ${value}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError("Could not copy the settings.");
    }
  };

  const handleGenerateAgain = () => {
    setResult(null);
    setCopied(false);
    setError("");
  };

  return (
    <main className="generator-page">
      <section className="generator-page-header">

        <Link to="/store" className="back-link">
          ← Back to Store
        </Link>

        <span className="red-label">
          FREE FIRE ONLY
        </span>

        <h1>
          SENSITIVITY
          <br />
          <span>GENERATOR.</span>
        </h1>

        <p>
          Choose your device, phone model and play style
          to generate a BOLOX Free Fire sensitivity setup.
        </p>

        <div className="generation-counter">
          <strong>{remaining}</strong>
          <span>
            FREE GENERATIONS LEFT TODAY
          </span>
        </div>

      </section>

      <section className="generator-container">

        {!result ? (

          <div className="generator-form">

            <div className="form-header">

              <span>01</span>

              <div>
                <h2>Select your device</h2>
                <p>
                  Choose the brand you use to play Free Fire.
                </p>
              </div>

            </div>

            <div className="device-grid">

              {devices.map((item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    device === item
                      ? "device-option selected"
                      : "device-option"
                  }
                  onClick={() => {
                    setDevice(item);
                    setModel("");
                  }}
                >
                  {item}
                </button>

              ))}

            </div>

            {device && (

              <div className="model-selector">

                <label htmlFor="device-model">
                  Select your {device} model
                </label>

                <select
                  id="device-model"
                  value={model}
                  onChange={(e) =>
                    setModel(e.target.value)
                  }
                >

                  <option value="">
                    Choose your model
                  </option>

                  {deviceModels[device]?.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

            )}

            <div className="form-header second">

              <span>02</span>

              <div>
                <h2>Select your play style</h2>
                <p>
                  Choose the option that best matches
                  how you play.
                </p>
              </div>

            </div>

            <div className="style-grid">

              {playStyles.map((item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    style === item
                      ? "style-option selected"
                      : "style-option"
                  }
                  onClick={() =>
                    setStyle(item)
                  }
                >

                  <strong>{item}</strong>

                  <small>
                    {item === "Rusher" &&
                      "Fast movement and close-range fights"}

                    {item === "SMG" &&
                      "Aggressive close-range SMG gameplay"}

                    {item === "Sniper" &&
                      "Lower sensitivity for precision"}

                    {item === "Balanced" &&
                      "A mix of speed and control"}

                    {item === "One-Tap" &&
                      "Fast drag and headshot-focused setup"}
                  </small>

                </button>

              ))}

            </div>

            {error && (
              <div className="generator-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="generate-main-button"
              onClick={handleGenerate}
              disabled={remaining === 0}
            >

              {remaining === 0
                ? "Daily Limit Reached"
                : "Generate My Sensitivity →"}

            </button>

            <p className="generator-note">
              Free users can generate up to
              5 setups per day.
            </p>

          </div>

        ) : (

          <div className="results-container">

            <div className="results-header">

              <div>

                <span className="red-label">
                  GENERATED SETUP
                </span>

                <h2>
                  Your BOLOX
                  <br />
                  <span>Sensitivity.</span>
                </h2>

              </div>

              <div className="result-details">

                <span>{result.device}</span>
                <span>{result.model}</span>
                <span>{result.style}</span>
                <span>FREE FIRE</span>

              </div>

            </div>

            <div className="sensitivity-results">

              {Object.entries(
                result.settings
              ).map(([name, value]) => (

                <div
                  className="sensitivity-row"
                  key={name}
                >

                  <div>

                    <span>{name}</span>

                    <div className="sensitivity-bar">

                      <div
                        style={{
                          width: `${
                            (value / 200) * 100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  <strong>{value}</strong>

                </div>

              ))}

            </div>

            {error && (
              <div className="generator-error">
                {error}
              </div>
            )}

            <div className="results-actions">

              <button
                type="button"
                className="generate-again"
                onClick={handleGenerateAgain}
              >
                Generate Again
              </button>

              <button
                type="button"
                className="copy-button"
                onClick={handleCopy}
              >
                {copied
                  ? "Copied ✓"
                  : "Copy Settings"}
              </button>

            </div>

            <p className="remaining-text">
              {remaining} free generations
              remaining today.
            </p>

          </div>

        )}

      </section>
    </main>
  );
}

export default SensitivityGenerator;