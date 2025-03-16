import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bike, Coffee, Utensils, AlertCircle, Map } from 'lucide-react';

const BudapestTravelApp = () => {
  const [itinerary, setItinerary] = useState([]);
  const [activeDay, setActiveDay] = useState('Domingo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await window.fs.readFile('Budapest.csv', { encoding: 'utf8' });
        parseCSV(csvData);
      } catch (error) {
        console.error('Error loading itinerary:', error);
        setError('No se pudo cargar el itinerario');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const parseCSV = (csvData) => {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    
    const parsedData = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      const values = rows[i].split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        entry[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      parsedData.push(entry);
    }
    
    setItinerary(parsedData);
  };

  const days = [...new Set(itinerary.map(item => item.Día))];

  const getActivityIcon = (activity) => {
    if (activity.includes('Paseo') || activity.includes('barrio')) return <Bike className="text-blue-500" />;
    if (activity.includes('Almuerzo') || activity.includes('Cena')) return <Utensils className="text-orange-500" />;
    if (activity.includes('Café') || activity.includes('Merienda')) return <Coffee className="text-brown-500" />;
    return <Calendar className="text-purple-500" />;
  };

  const getTransportColor = (transport) => {
    if (transport.includes('pie')) return 'bg-green-100 text-green-800';
    if (transport.includes('Taxi')) return 'bg-yellow-100 text-yellow-800';
    if (transport.includes('Metro') || transport.includes('Tranvía') || transport.includes('Autobús')) return 'bg-blue-100 text-blue-800';
    if (transport.includes('Bici')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando itinerario...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold">Tu Viaje a Budapest</h1>
        <p className="mt-2">Itinerario personalizado para disfrutar de la ciudad</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto py-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
                activeDay === day 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {itinerary
          .filter(item => item.Día === activeDay)
          .map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    {getActivityIcon(item.Actividad)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.Actividad}</h3>
                    <p className="text-gray-600">{item['Lugar/Detalles']}</p>
                    {item['Lugar/Detalles'] && item['Lugar/Detalles'] !== '-' && item['Lugar/Detalles'] !== 'Vuelo IB871.' && !item['Lugar/Detalles'].includes('Vuelo de regreso') && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item['Lugar/Detalles'] + ' Budapest')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                      >
                        <Map className="w-3 h-3 mr-1" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{item.Hora}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item['Transporte recomendado'] && item['Transporte recomendado'] !== '-' && (
                  <div className={`text-xs px-2 py-1 rounded-full flex items-center ${getTransportColor(item['Transporte recomendado'])}`}>
                    <MapPin className="w-3 h-3 mr-1" />
                    {item['Transporte recomendado']}
                  </div>
                )}
                
                {item['Actividad alternativa'] && item['Actividad alternativa'] !== '-' && (
                  <div className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Alt: {item['Actividad alternativa']}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-bold text-blue-800 mb-2">Consejos para tu viaje</h2>
        <ul className="list-disc pl-5 space-y-1 text-blue-700">
          <li>El transporte público es muy eficiente en Budapest, considera comprar un pase para varios días</li>
          <li>No olvides visitar alguno de los famosos baños termales de la ciudad</li>
          <li>Prueba el Goulash (sopa tradicional) y los langos (pan frito)</li>
          <li>La moneda local es el Florín Húngaro (HUF), no el Euro</li>
          <li>Lleva calzado cómodo, hay muchas zonas empedradas</li>
        </ul>
        
        <div className="mt-4">
          <h3 className="font-bold text-blue-800 mb-2">Enlaces útiles:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a 
              href="https://www.google.com/maps/d/viewer?mid=1JVUoRs7PIGvjmE6YkXCNVhN3CdI&hl=en_US&ll=47.48710973413437%2C19.060236999999964&z=12" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-white rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Map className="w-4 h-4 mr-2" />
              Mapa turístico de Budapest
            </a>
            <a 
              href="https://www.google.com/maps/search/Transporte+público+Budapest" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-white rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Estaciones de transporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudapestTravelApp;
