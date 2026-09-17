'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/kazakhstan/kazakhstan-regions.json';

interface MapProps {
  onSelectRegion: (regionName: string) => void;
  selectedRegion?: string;
}

export default function KazakhstanMap({ onSelectRegion, selectedRegion }: MapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-[#151022] p-4 rounded-2xl border border-[#241a36]">
      {/* Название области при наведении */}
      <div className="text-center mb-2 h-6 text-xs font-semibold text-[#c77dff]">
        {hoveredRegion ? hoveredRegion : 'Выберите область или город на карте'}
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1100,
          center: [67, 48],
        }}
        className="w-full h-auto max-h-[350px]"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo: any) => {
              // Безопасное получение названия с опциональной цепочкой (?.)
              const regionName = geo.properties?.NAME_1 || geo.properties?.name || 'Регион';
              const isSelected = selectedRegion === regionName;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHoveredRegion(regionName)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => onSelectRegion(regionName)}
                  style={{
                    default: {
                      fill: isSelected ? '#9d4edd' : '#241a36',
                      stroke: '#7b2cbf',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#7b2cbf',
                      stroke: '#c77dff',
                      strokeWidth: 1.5,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#5a189a',
                      outline: 'none',
                    },
                  } as any}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}