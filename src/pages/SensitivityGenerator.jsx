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

const playStyles = [
  "Rusher",
  "SMG",
  "Sniper",
  "Balanced",
  "One-Tap",
];

function generateSettings(device, style) {
  const baseSettings = {
    General: 190,
    "Red Dot": 180,
    "2X Scope": 170,
    "4X Scope": 155,
    "Sniper Scope": 90,
    "Free Look": 180,
  };

  const adjustments = {
    Rusher: 8,
    SMG: 6,
    Sniper: -12,
    Balanced: 0,
    "One-Tap": 10,
  };

  const adjustment = adjustments[style] || 0;

  return {
    device,
    style,
    settings: Object.fromEntries(
      Object.entries(baseSettings).map(([key, value]) => [
        key,
        Math.min(200, Math.max(0, value + adjustment)),
      ])
    ),
  };
}

function SensitivityGenerator() {
  const [device, setDevice] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [generations, setGenerations] = useState(() => {
    const saved = localStorage.getItem("bolox_generations");

    if (!saved) {
      return 0;
    }

    const data = JSON.parse(saved);

    if (data.date !== new Date().toDateString()) {
      localStorage.removeItem("bolox_generations");
      return 0;
    }

    return data.count;
  });

  const generate = () => {
    setError("");

    if (!device || !style) {
      setError("Please select your device and play style.");
      return;
    }

    if (generations >= 5) {
      setError(
        "You've reached your 5 free generations for today. Come back tomorrow or unlock Premium."
      );
      return;
    }

    const newResult = generateSettings(device, style);

    const newCount = generations + 1;

    setGenerations(newCount);

    localStorage.setItem(
      "bolox_generations",
      JSON.stringify({
        date: new Date().toDateString(),
        count: newCount,
      })
    );

    setResult(newResult);
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return (
    <main className="generator-page">

      {/* HEADER */}

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
          Create a personalized Free Fire sensitivity setup
          based on your device and play style.
        </p>

        <div className="generation-counter">
          <strong>{5 - generations}</strong>
          <span>FREE GENERATIONS LEFT TODAY</span>
        </div>

      </section>


      {/* GENERATOR */}

      <section className="generator-container">

        {!result ? (

          <div className="generator-form">

            <div className="form-header">
              <span>01</span>

              <div>
                <h2>Select your device</h2>
                <p>
                  Choose the device you play Free Fire on.
                </p>
              </div>
            </div>

            <div className="device-grid">

              {devices.map((item) => (

                <button
                  key={item}
                  className={
                    device === item
                      ? "device-option selected"
                      : "device-option"
                  }
                  onClick={() => setDevice(item)}
                >
                  {item}
                </button>

              ))}

            </div>


            <div className="form-header second">

              <span>02</span>

              <div>
                <h2>Select your play style</h2>
                <p>
                  Choose the style that best matches your gameplay.
                </p>
              </div>

            </div>

            <div className="style-grid">

              {playStyles.map((item) => (

                <button
                  key={item}
                  className={
                    style === item
                      ? "style-option selected"
                      : "style-option"
                  }
                  onClick={() => setStyle(item)}
                >

                  <strong>{item}</strong>

                  <small>
                    {item === "Rusher" &&
                      "Fast movement & close combat"}

                    {item === "SMG" &&
                      "Aggressive SMG gameplay"}

                    {item === "Sniper" &&
                      "Long-range precision"}

                    {item === "Balanced" &&
                      "All-around gameplay"}

                    {item === "One-Tap" &&
                      "Headshot focused"}
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
              className="generate-main-button"
              onClick={generate}
            >
              Generate My Sensitivity →
            </button>

            <p className="generator-note">
              Free users can generate up to 5 setups per day.
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
                <span>{result.style}</span>
                <span>FREE FIRE</span>
              </div>

            </div>


            <div className="sensitivity-results">

              {Object.entries(result.settings).map(
                ([name, value]) => (

                  <div
                    className="sensitivity-row"
                    key={name}
                  >

                    <div>
                      <span>{name}</span>

                      <div className="sensitivity-bar">
                        <div
                          style={{
                            width: `${(value / 200) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <strong>
                      {value}
                    </strong>

                  </div>

                )
              )}

            </div>


            <div className="results-actions">

              <button
                className="generate-again"
                onClick={reset}
              >
                Generate Again
              </button>

              <button
                className="copy-button"
                onClick={() => {
                  const text = Object.entries(
                    result.settings
                  )
                    .map(
                      ([name, value]) =>
                        `${name}: ${value}`
                    )
                    .join("\n");

                  navigator.clipboard.writeText(text);
                }}
              >
                Copy Settings
              </button>

            </div>


            <p className="remaining-text">
              {5 - generations} free generations remaining today.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}

export default SensitivityGenerator;