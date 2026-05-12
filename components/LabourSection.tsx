import type { Dispatch, SetStateAction } from "react";

type Props = {
  hourlyRate: number;
  setHourlyRate: (value: number) => void;
  operatorAmount: number;
  setOperatorAmount: (value: number) => void;
  currentLabourTotal: number;
  getProductLabourCostPerUnit: () => number;
  machineStaffing: Record<string, number>;
  setMachineStaffing: Dispatch<SetStateAction<Record<string, number>>>;
  machineHours: Record<string, number>;
  setMachineHours: Dispatch<SetStateAction<Record<string, number>>>;
  selectedMachines: string[];
  formatMoney: (value: number) => string;
  inputClass: string;
};

export default function LabourSection({
  hourlyRate,
  setHourlyRate,
  operatorAmount,
  setOperatorAmount,
  currentLabourTotal,
  getProductLabourCostPerUnit,
  machineStaffing,
  setMachineStaffing,
  machineHours,
  setMachineHours,
  selectedMachines,
  formatMoney,
  inputClass,
}: Props) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">
        Labour Breakdown
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 items-end">
        <div>
          <div className="mb-1 text-xs text-slate-500">
            Hourly Rate (€)
          </div>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-500">
            Operators
          </div>
          <input
            type="number"
            value={operatorAmount}
            onChange={(e) =>
              setOperatorAmount(Math.max(1, Number(e.target.value) || 1))
            }
            className={inputClass}
          />
        </div>

        <div className="text-sm text-slate-600">
          Labour total: <strong>{formatMoney(currentLabourTotal)}</strong>
        </div>

        <div className="text-sm text-slate-600">
          Labour/unit:{" "}
          <strong>{formatMoney(getProductLabourCostPerUnit())}</strong>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-slate-500">
          <div>Machine</div>
          <div>Staff Required</div>
          <div>Hours Used</div>
        </div>

        {selectedMachines.map((machine) => (
          <div
            key={machine}
            className="grid grid-cols-3 gap-2 items-center"
          >
            <div className="capitalize text-sm text-slate-700">
              {machine}
            </div>

            <input
              type="number"
              value={machineStaffing[machine] || 0}
              onChange={(e) =>
                setMachineStaffing((prev) => ({
                  ...prev,
                  [machine]: Number(e.target.value) || 0,
                }))
              }
              className={inputClass}
              placeholder="Staff"
            />

            <input
              type="number"
              value={machineHours[machine] || 0}
              onChange={(e) =>
                setMachineHours((prev) => ({
                  ...prev,
                  [machine]: Number(e.target.value) || 0,
                }))
              }
              className={inputClass}
              placeholder="Hours"
            />
          </div>
        ))}
      </div>
    </div>
  );
}