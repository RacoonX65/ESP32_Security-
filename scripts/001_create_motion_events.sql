-- Create motion_events table to store motion detection data from ESP32 sensors
create table if not exists public.motion_events (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  sensor_location text not null,
  created_at timestamptz not null default now()
);

-- Create index for faster queries on timestamp
create index if not exists motion_events_timestamp_idx on public.motion_events(timestamp desc);

-- Create index for sensor location queries
create index if not exists motion_events_sensor_idx on public.motion_events(sensor_location);
