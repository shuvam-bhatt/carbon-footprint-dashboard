import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Paper
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import './App.css';


// Helper functions to calculate carbon footprint, carbon sink, and gap
const calculateCarbonFootprint = (row) => {
  return (
    row.excavation * 0.5 +
    row.transportation * 0.7 +
    row.equipmentUsage * 0.3 +
    row.energyConsumption * 0.82 +
    row.methaneEmission * 25
  ).toFixed(2);
};

const calculateCarbonSink = (row) => {
  return (row.afforestation * 0.4 + row.reclamation * 0.3).toFixed(2);
};

const calculateGap = (carbonFootprint, carbonSink) => {
  return (carbonFootprint - carbonSink).toFixed(2);
};

const calculateCarbonCredits = (carbonFootprint, rate = 20) => {
  return ((carbonFootprint / 1000) * rate).toFixed(2); // Assuming rate is per ton of CO₂e
};

const SOLAR_PANEL_EFFICIENCY = 0.15; // Average efficiency of solar panels
const SOLAR_INSOLATION = 5.5; // Average solar insolation in kWh/m²/day

const calculateLandForSolarPanels = (energyConsumption) => {
  // Energy consumption in kWh
  // Average annual energy production per square meter
  const annualEnergyProductionPerSqMeter = SOLAR_INSOLATION * 365 * SOLAR_PANEL_EFFICIENCY;
  return (energyConsumption / annualEnergyProductionPerSqMeter).toFixed(2);
};

const generatePathwaySuggestions = (gap) => {
  const suggestions = [];


  if (gap <= 0) {
    suggestions.push("Congratulations! You've achieved carbon neutrality. Focus on maintaining and improving your current practices.");
    return suggestions.join("\n");
  }

  if (gap > 0 && gap <= 1000) {
    suggestions.push("You're close to carbon neutrality. Consider these options:");
    suggestions.push("Optimize energy efficiency in your operations.");
    suggestions.push("Increase afforestation efforts on available land.");
    suggestions.push("Invest in renewable energy sources like solar or wind power.");
  } else if (gap > 1000 && gap <= 5000) {
    suggestions.push("You have a moderate carbon gap. Here are some pathways to consider:");
    suggestions.push("Implement a comprehensive energy management system.");
    suggestions.push("Transition to electric or hydrogen-powered equipment where possible.");
    suggestions.push("Explore carbon capture and storage technologies.");
    suggestions.push("Increase investment in land reclamation and reforestation projects.");
  } else {
    suggestions.push("You have a significant carbon gap. Consider these major initiatives:");
    suggestions.push("Conduct a full carbon audit and develop a long-term reduction strategy.");
    suggestions.push("Invest in breakthrough technologies for carbon-neutral mining.");
    suggestions.push("Partner with environmental organizations for large-scale offset projects.");
    suggestions.push("Consider restructuring operations to prioritize low-carbon extraction methods.");
  }
  suggestions.push("");
  suggestions.push("Additional recommendations for all levels:");
  suggestions.push("Explore carbon credit markets to offset remaining emissions.");
  suggestions.push("Engage in industry collaborations to develop innovative carbon reduction solutions.");

  return suggestions.join("\n");
};

// Main App Component
function App() {
  const [data, setData] = useState([]);
  const [selectedMine, setSelectedMine] = useState('');
  const [suggestions, setSuggestions] = useState('');

  useEffect(() => {
    // Fetching data from the server
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const fetchedData = await response.json();
        const dataWithCalculations = fetchedData.map(row => ({
          ...row,
          excavation: parseFloat(row.excavation),
          transportation: parseFloat(row.transportation),
          equipmentUsage: parseFloat(row.equipmentUsage),
          energyConsumption: parseFloat(row.energyConsumption),
          methaneEmission: parseFloat(row.methaneEmission),
          afforestation: parseFloat(row.afforestation),
          reclamation: parseFloat(row.reclamation),
          carbonFootprint: parseFloat(calculateCarbonFootprint(row)),
          carbonSink: parseFloat(calculateCarbonSink(row)),
          gap: parseFloat(calculateGap(calculateCarbonFootprint(row), calculateCarbonSink(row))),
        }));
        setData(dataWithCalculations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (name, field, value) => {
    const updatedData = data.map(row => {
      if (row.name === name) {
        const updatedRow = { ...row, [field]: parseFloat(value) || 0 };
        return {
          ...updatedRow,
          carbonFootprint: parseFloat(calculateCarbonFootprint(updatedRow)),
          carbonSink: parseFloat(calculateCarbonSink(updatedRow)),
          gap: parseFloat(calculateGap(calculateCarbonFootprint(updatedRow), calculateCarbonSink(updatedRow))),
        };
      }
      return row;
    });
    setData(updatedData);

    fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    }).catch((error) => console.error('Error updating data:', error));
  };

  const getSuggestions = (gap) => {
    return generatePathwaySuggestions(gap);
  };

  useEffect(() => {
    if (selectedMine) {
      const mineData = data.find(row => row.name === selectedMine);
      if (mineData && mineData.gap) {
        const suggestions = getSuggestions(mineData.gap);
        setSuggestions(suggestions);
      }
    }
  }, [selectedMine, data]);

  const handleMineChange = (event) => {
    setSelectedMine(event.target.value);
  };

  const selectedMineData = data.find(row => row.name === selectedMine);

  return (
    <div className="container">
      <h1>Carbon Footprint Dashboard</h1>
      <p>A <b class="foot">carbon footprint</b> is the total amount of greenhouse gases (GHGs), particularly carbon dioxide (CO₂), that are emitted directly or indirectly by human activities, expressed in terms of carbon dioxide equivalents (CO₂e).</p>
      <FormControl fullWidth className="form-control">
        <InputLabel>Select a Mine</InputLabel>
        <Select value={selectedMine} onChange={handleMineChange}>
          
          {data.map((row) => (
            <MenuItem key={row.name} value={row.name}>
              {row.name}
            </MenuItem>
            
          ))}
        </Select>
        <img src="untitled.png" alt="Mine" style={{ width: '100%', height: 'auto' }} />
      </FormControl>
          
      {selectedMineData && (
        <>
          <Paper className="paper-container">
            <Grid container spacing={2}>
              {/* Input fields for different emission sources */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Excavation (m³)"
                  type="number"
                  value={selectedMineData.excavation}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'excavation', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Transportation (t⋅km)"
                  type="number"
                  value={selectedMineData.transportation}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'transportation', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Equipment Usage (kWh)"
                  type="number"
                  value={selectedMineData.equipmentUsage}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'equipmentUsage', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Energy Consumption (kWh)"
                  type="number"
                  value={selectedMineData.energyConsumption}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'energyConsumption', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Methane Emission (kg CH₄)"
                  type="number"
                  value={selectedMineData.methaneEmission}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'methaneEmission', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Afforestation (ha)"
                  type="number"
                  value={selectedMineData.afforestation}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'afforestation', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Reclamation (ha)"
                  type="number"
                  value={selectedMineData.reclamation}
                  onChange={(e) => handleInputChange(selectedMineData.name, 'reclamation', e.target.value)}
                  fullWidth
                />
              </Grid>

              {/* Display carbon footprint, carbon sink, and gap */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1" style={{ fontWeight: 'bold', color: '#ff5722', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  Carbon Footprint: {selectedMineData.carbonFootprint} kg CO₂e
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" style={{ fontWeight: 'bold', color: '#4caf50', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  Carbon Sink: {selectedMineData.carbonSink} kg CO₂e
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" style={{ fontWeight: 'bold', color: '#2196f3', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  Gap: {selectedMineData.gap} kg CO₂e
                </Typography>
              </Grid>
              

            </Grid>
          </Paper>
          {/* <img src="map.png" alt="Mine" style={{ width: '100%', height: 'auto' }} /> */}
          {/* Bar chart for carbon footprint */}
          <div className="chart-container">
            <h2>Carbon Footprint Bar Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="carbonFootprint" fill="#8884d8">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === selectedMine ? '#ff7300' : '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart for carbon sink */}
          <div className="chart-container">
            <h2>Carbon Sink Line Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="carbonSink" stroke="#82ca9d" activeDot={{ r: 8 }}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === selectedMine ? '#ff7300' : '#82ca9d'} />
                  ))}
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Blocks */}
          <div className="additional-blocks">
            {/* Carbon Neutrality Pathways */}
            <div className="block">
              <h3>Pathways to Carbon Neutrality</h3>
              <img src="image.png" alt="Carbon Neutrality Pathways" className="block-image" />
              <p>{suggestions}</p>
            </div>

            {/* Afforestation Offsets */}
            <div className="block">
              <h3>Afforestation Offsets</h3>
              <img src="shshshs.jpg" alt="Tree Offset" className="block-image" />
              <p>Afforestation Area: {selectedMineData.afforestation}ha<br></br> <b class="card"> Afforestation offsets refer to the carbon credits or emissions reductions achieved through the process of afforestation, which is the planting of trees on land that has not been forested for a long time.</b>
              </p>
            </div>

            {/* Carbon Credits */}
            <div className="block">
              <h3>Carbon Credits Estimation</h3>
              <img src="shsji.png" alt="Carbon Credits" className="block-image" />
              <p>Potential Carbon Credits: ${calculateCarbonCredits(selectedMineData.carbonFootprint)} at $20/ton<br></br><b class="card">Carbon Credits Estimation refers to the process of calculating the number of carbon credits a project or activity can generate based on its ability to reduce or offset greenhouse gas emissions. Carbon credits are used in carbon trading systems as a way to offset emissions and meet regulatory requirements or voluntary climate goals.</b></p>
            </div>

            {/* Other Renewables */}
            <div className="block block2">
              <h3>Solar Panel</h3>
              <img src="solar.png" alt="Solar Panels" className="block-image" />
              <p>Land Required: {selectedMineData ? calculateLandForSolarPanels(selectedMineData.energyConsumption) : 'N/A'} m²<br></br><b class="card">Based on the energy consumption of a mine or operation, the required land area for solar panels to offset that energy use. This estimation helps determine the amount of renewable energy needed to meet the mine’s energy demands and how much CO₂ emissions can be reduced as a result.</b></p>
            </div>
          </div>
          
          <div className="block2">
            <h1>For you</h1>
            <iframe width="300" src="https://www.youtube.com/embed/a9yO-K8mwL0?si=aiSU36R4AnfpDW-I" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>

            <iframe width="300" src="https://www.youtube.com/embed/bYb7YLsXvzg?si=nKheDSEEGXVFYWzk" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>

            <iframe width="300" src="https://www.youtube.com/embed/nMn59yNwoZ8?si=JqKYubgrnsMM2PfR" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>

            <iframe width="300" src="https://www.youtube.com/embed/Nnky_oD8YLg?si=Gt80m_0W_iAHF9PN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

          </div>

        </>
      )}
    </div>
  );

}

export default App;
