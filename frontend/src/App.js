import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const calculateCarbonFootprint = (row) => {
  return (
    row.excavation * 0.5 +       // Excavation emission factor (e.g., 0.5 kg CO₂e per m³)
    row.transportation * 0.7 +   // Transportation emission factor (e.g., 0.7 kg CO₂e per t-km)
    row.equipmentUsage * 0.3 +   // Equipment usage emission factor (e.g., 0.3 kg CO₂e per kWh)
    row.energyConsumption * 0.82 + // Energy consumption emission factor (0.82 kg CO₂e per kWh)
    row.methaneEmission * 25     // Methane emission factor (25 kg CO₂e per kg CH₄)
  ).toFixed(2);
};

function App() {
  const [data, setData] = useState([]);

  // Fetch data from backend (which reads from CSV)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');  // Backend endpoint to fetch data
        const fetchedData = await response.json();
        const dataWithFootprint = fetchedData.map(row => ({
          ...row,
          excavation: parseFloat(row.excavation),
          transportation: parseFloat(row.transportation),
          equipmentUsage: parseFloat(row.equipmentUsage),
          energyConsumption: parseFloat(row.energyConsumption),
          methaneEmission: parseFloat(row.methaneEmission),
          carbonFootprint: calculateCarbonFootprint(row)
        }));
        setData(dataWithFootprint);
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
          carbonFootprint: calculateCarbonFootprint(updatedRow)
        };
      }
      return row;
    });
    setData(updatedData);

    // Send updated data to backend to update CSV
    fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    }).catch((error) => console.error('Error updating data:', error));
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="container">
      <h1>Carbon Footprint Dashboard</h1>
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Excavation (m³)</TableCell>
              <TableCell>Transportation (t⋅km)</TableCell>
              <TableCell>Equipment Usage (kWh)</TableCell>
              <TableCell>Energy Consumption (kWh)</TableCell>
              <TableCell>Methane Emission (kg CH₄)</TableCell>
              <TableCell>Carbon Footprint (kg CO₂e)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <TextField
                    className="text-field"
                    type="number"
                    value={row.excavation}
                    onChange={(e) => handleInputChange(row.name, 'excavation', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    className="text-field"
                    type="number"
                    value={row.transportation}
                    onChange={(e) => handleInputChange(row.name, 'transportation', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    className="text-field"
                    type="number"
                    value={row.equipmentUsage}
                    onChange={(e) => handleInputChange(row.name, 'equipmentUsage', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    className="text-field"
                    type="number"
                    value={row.energyConsumption}
                    onChange={(e) => handleInputChange(row.name, 'energyConsumption', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    className="text-field"
                    type="number"
                    value={row.methaneEmission}
                    onChange={(e) => handleInputChange(row.name, 'methaneEmission', e.target.value)}
                  />
                </TableCell>
                <TableCell>{row.carbonFootprint}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="chart-container">
        <div className="chart">
          <h2>Carbon Footprint Bar Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="carbonFootprint" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart">
          <h2>Carbon Footprint Pie Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="carbonFootprint"
                nameKey="name"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
