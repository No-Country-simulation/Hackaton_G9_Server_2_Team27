#!/bin/bash
echo "=== 🧪 PROBANDO 3 ESCENARIOS DEL MVP ENERGIAGI ==="
echo ""

echo "1. Ejemplo 1: Perfil Eficiente (Consumo Bajo)"
curl -s -X POST http://localhost:8080/analisis-energetico \
  -H "Content-Type: application/json" \
  -d '{
    "consumo_kwh": 140,
    "uso_horario_pico": false,
    "cantidad_equipos": 4,
    "tipo_inmueble": "Casa",
    "horas_alto_consumo": 2,
    "metros_cuadrados": 50,
    "cantidad_personas": 2
  }' | jq .

echo -e "\n------------------------------------------------\n"

echo "2. Ejemplo 2: Perfil Moderado (Ejemplo oficial de la consigna)"
curl -s -X POST http://localhost:8080/analisis-energetico \
  -H "Content-Type: application/json" \
  -d '{
    "consumo_kwh": 340,
    "uso_horario_pico": true,
    "cantidad_equipos": 9,
    "tipo_inmueble": "Casa",
    "horas_alto_consumo": 5,
    "metros_cuadrados": 100,
    "cantidad_personas": 3
  }' | jq .

echo -e "\n------------------------------------------------\n"

echo "3. Ejemplo 3: Perfil Ineficiente (Consumo Alto / Requisito MVP)"
curl -s -X POST http://localhost:8080/analisis-energetico \
  -H "Content-Type: application/json" \
  -d '{
    "consumo_kwh": 680,
    "uso_horario_pico": true,
    "cantidad_equipos": 18,
    "tipo_inmueble": "Comercio",
    "horas_alto_consumo": 10,
    "metros_cuadrados": 180,
    "cantidad_personas": 6
  }' | jq .

echo -e "\n=== ✅ PRUEBAS FINALIZADAS ==="
