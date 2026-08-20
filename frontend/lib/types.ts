export interface PaymentRecord {
  date: string;
  amount: number;
}

export interface Customer {
  id: string;
  service_account_number: string;
  zip_code: string;
  state: string;
  city: string;
  street_address: string;
  kwh_consumed_current_cycle: number;
  lifetime_kwh_consumed: number;
  payment_history: PaymentRecord[];
  total_overdue_payment: number;
}

export interface CustomerInput {
  service_account_number: string;
  zip_code: string;
  state: string;
  city: string;
  street_address: string;
  kwh_consumed_current_cycle: number;
  lifetime_kwh_consumed: number;
  total_overdue_payment: number;
}

export type PowerType =
  | "wind"
  | "hydro"
  | "solar"
  | "geothermal"
  | "natural gas"
  | "coal"
  | "nuclear"
  | "waste heat";

export interface PowerSource {
  id: string;
  name: string;
  power_type: PowerType;
  instantaneous_output_mw: number;
  actual_output_mwh: number;
}

export interface PowerSourceInput {
  name: string;
  power_type: PowerType;
  instantaneous_output_mw: number;
  actual_output_mwh: number;
}

/** day (0-6, 0=Sunday) -> hour (0-23) -> power_source_id. Sparse - only assigned slots present. */
export type ScheduleGrid = Record<string, Record<string, string>>;

export interface Schedule {
  grid: ScheduleGrid;
}
