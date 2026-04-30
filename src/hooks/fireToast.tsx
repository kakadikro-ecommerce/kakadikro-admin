import toast from 'react-hot-toast';
import dataJSON from '../../public/data.json';

type AlertType = '0' | '1' | '2';
type Criterion = '0' | '1' | '2' | '3' | '4';

interface AlertSetting {
  id: string;
  para: string;
  criterion: Criterion;
  value: string;
  type: AlertType;
}

interface DataPoint {
  price?: number;
  rating?: string | number;
  [key: string]: string | number | undefined;
}

const marketData = dataJSON as Record<string, DataPoint>;

const createToast = (title: string, msg: string, type: AlertType) => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full ${type === '0'
          ? 'bg-[#04b20c]'
          : type === '1'
            ? 'bg-[#eab90f]'
            : 'bg-[#e13f32]'
        } shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4 ">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-1 text-sm text-white">{msg}</p>
          </div>
        </div>
      </div>
      <div className="flex">
        <button
          onClick={() => toast.dismiss(t.id)}
          type="button"
          className="mr-2 box-content rounded-none border-none opacity-100 hover:no-underline hover:opacity-50 focus:opacity-50 focus:shadow-none focus:outline-none text-white"
          data-te-toast-dismiss
          aria-label="Close"
        >
          <span className="w-[1em] focus:opacity-100 disabled:pointer-events-none disabled:select-none disabled:opacity-25 [&.disabled]:pointer-events-none [&.disabled]:select-none [&.disabled]:opacity-25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  ));
};

const getComparisonLabel = (criterion: Criterion) => {
  switch (criterion) {
    case '0':
      return 'goes down by';
    case '1':
      return 'goes up by';
    case '2':
      return 'is smaller than';
    case '3':
      return 'is greater than';
    default:
      return 'is equal to';
  }
};

const getNumericValue = (point: DataPoint | undefined, key: string) => {
  const value = point?.[key];
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const fireToast = () => {
  const alertSettings = localStorage.getItem('alertSettings');
  if (!alertSettings) return;

  const parsedSettings = JSON.parse(alertSettings) as AlertSetting[];

  for (const alertSetting of parsedSettings) {
    const value = Number.isNaN(Number(alertSetting.value))
      ? alertSetting.value
      : Number(alertSetting.value);
    const para =
      alertSetting.criterion === '0' || alertSetting.criterion === '1'
        ? `delta_${alertSetting.para}`
        : alertSetting.para;

    const evaluateRecord = (id: string, point: DataPoint | undefined) => {
      const metric = getNumericValue(point, para);
      if (metric === null || typeof value !== 'number') return;

      const condition =
        alertSetting.criterion === '0'
          ? value <= -1 * metric
          : alertSetting.criterion === '1' || alertSetting.criterion === '3'
            ? value >= metric
            : alertSetting.criterion === '2'
              ? value <= metric
              : value === metric;

      const realValue = alertSetting.criterion === '0' ? metric * -1 : metric;

      if (condition) {
        const msg = `${alertSetting.para} of ${id} ${getComparisonLabel(
          alertSetting.criterion,
        )} ${realValue}`;
        createToast(id, msg, alertSetting.type);
      }
    };

    if (alertSetting.id === 'ALL') {
      Object.keys(marketData).forEach((id) => evaluateRecord(id, marketData[id]));
    } else {
      evaluateRecord(alertSetting.id, marketData[alertSetting.id]);
    }
  }
};

export default fireToast;