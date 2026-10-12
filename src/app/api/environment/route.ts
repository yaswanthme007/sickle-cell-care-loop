import { NextRequest, NextResponse } from 'next/server';
import { EnvironmentalData } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Live Meteorological Telemetry Endpoint for Shahdol District, Madhya Pradesh
 * Coordinates: 23.2960° N, 81.3567° E (Shahdol / Burhar Tribal Belt)
 * Uses Open-Meteo Free Meteorological API with deterministic clinical fallback when offline.
 */
export async function GET(req: NextRequest) {
  const village = req.nextUrl.searchParams.get('village') || 'Burhar, Shahdol';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3200);

    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=23.296&longitude=81.3567&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=1';

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const tempC = Number(data?.current?.temperature_2m ?? 32.4);
      const humidity = Number(data?.current?.relative_humidity_2m ?? 44);
      const apparentC = Number(data?.current?.apparent_temperature ?? tempC + 1.8);
      const maxC = Number(data?.daily?.temperature_2m_max?.[0] ?? tempC + 4);
      const minC = Number(data?.daily?.temperature_2m_min?.[0] ?? tempC - 7.5);
      const swing = Math.max(4, Number((maxC - minC).toFixed(1)));

      const payload: EnvironmentalData = {
        location: `${village}, MP (23.30°N, 81.36°E)`,
        temperatureC: tempC,
        humidityPercent: humidity,
        heatIndexC: apparentC,
        diurnalSwingC: swing,
        weatherCondition:
          tempC >= 35
            ? 'High Thermal Stress'
            : swing >= 11
            ? 'High Diurnal Temperature Swing'
            : 'Moderate Central Indian Climate',
        isLiveApi: true,
        fetchedAt: new Date().toISOString()
      };

      return NextResponse.json(payload);
    }
  } catch {
    // Graceful fallback when running in offline village mode or sandboxed network
  }

  const fallbackPayload: EnvironmentalData = {
    location: `${village}, MP (Offline Telemetry Cache)`,
    temperatureC: 34.2,
    humidityPercent: 38,
    heatIndexC: 36.1,
    diurnalSwingC: 11.4,
    weatherCondition: 'Warm Dry Afternoon + 11.4°C Night Drop',
    isLiveApi: false,
    fetchedAt: new Date().toISOString()
  };

  return NextResponse.json(fallbackPayload);
}
