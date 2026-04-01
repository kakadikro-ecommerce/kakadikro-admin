import { useState, type ChangeEvent, type MouseEvent } from 'react';
import dataJSON from '../../public/data.json';

type CriterionValue = '0' | '1' | '2' | '3' | '4';
type AlertTypeValue = '0' | '1' | '2';

export interface AlertFormState {
  id: string;
  para: string;
  criterion: CriterionValue;
  value: string;
  type: AlertTypeValue;
}

interface ModalProps {
  closeModal: () => void;
  onSubmit: (value: AlertFormState) => void;
  defaultValue?: Partial<AlertFormState>;
}

const records = dataJSON as Record<string, Record<string, unknown>>;
const firstRecord = Object.values(records)[0] ?? {};
const fields = Object.keys(firstRecord).filter(
  (item) => !item.startsWith('delta_'),
);

const initialFormState: AlertFormState = {
  id: '',
  para: fields[0] ?? 'price',
  criterion: '0',
  value: '',
  type: '0',
};

export const Modal = ({ closeModal, onSubmit, defaultValue }: ModalProps) => {
  const [formState, setFormState] = useState<AlertFormState>({
    ...initialFormState,
    ...defaultValue,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    if (formState.id && formState.value) {
      setErrors([]);
      return true;
    }

    const errorFields: string[] = [];

    for (const [key, value] of Object.entries(formState)) {
      if (!value) {
        errorFields.push(key === 'id' ? 'Bond ID' : key);
        continue;
      }

      if (
        key === 'id' &&
        !(Object.keys(records).includes(String(value)) || value === 'ALL')
      ) {
        errorFields.push(`INVALID_ID_${String(value)}`);
      }
    }

    setErrors(errorFields);
    return false;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormState((prev) => {
      const nextState = {
        ...prev,
        [name]: value,
      } as AlertFormState;

      if (
        name === 'para' &&
        value === 'rating' &&
        Number(prev.criterion) > 1 &&
        Number(prev.criterion) < 4
      ) {
        nextState.criterion = '0';
      }

      return nextState;
    });
  };

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formState);
    closeModal();
  };

  return (
    <div
      className="modal-container fixed z-50 flex top-25 bottom-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="modal rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-auto">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <div className="w-full flex justify-end">
            <strong
              className="text-xl align-center cursor-pointer"
              onClick={closeModal}
            >
              &times;
            </strong>
          </div>
          <form>
            <div className="grid grid-cols-3 gap-5 justify-normal">
              <div className="form-group w-full col-span-3">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="id"
                >
                  Bond ID (Input "ALL" to track all bonds with paramaters below)
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  name="id"
                  onChange={handleChange}
                  value={formState.id}
                />
              </div>

              <div className="form-group">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="para"
                >
                  Parameter
                </label>
                <div className="relative z-20 w-full rounded border border-stroke p-1.5 pr-8 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                  <div className="flex flex-wrap items-center"></div>
                  <span className="m-1.5 flex items-center justify-center rounded border-[.5px] border-stroke bg-gray py-1.5 px-2.5 text-sm font-medium dark:border-strokedark dark:bg-white/30">
                    {formState.para}
                  </span>
                  <select
                    className="absolute top-0 left-0 z-20 h-full w-full bg-transparent opacity-0"
                    name="para"
                    onChange={handleChange}
                    value={formState.para}
                  >
                    {fields.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="criterion"
                >
                  Criterion
                </label>
                <div className="relative z-20 w-full rounded border border-stroke p-1.5 pr-8 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                  <div className="flex flex-wrap items-center"></div>
                  <span className="m-1.5 flex items-center justify-center rounded border-[.5px] border-stroke bg-gray py-1.5 px-2.5 text-sm font-medium dark:border-strokedark dark:bg-white/30">
                    {formState.criterion === '0'
                      ? 'goes down by'
                      : formState.criterion === '1'
                        ? 'goes up by'
                        : formState.criterion === '2'
                          ? 'is smaller than'
                          : formState.criterion === '3'
                            ? 'is greater than'
                            : 'is equal to'}
                  </span>
                  <select
                    className="absolute top-0 left-0 z-20 h-full w-full bg-transparent opacity-0"
                    name="criterion"
                    onChange={handleChange}
                    value={formState.criterion}
                  >
                    <option value="0">goes down by</option>
                    <option value="1">goes up by</option>
                    {formState.para !== 'rating' && (
                      <option value="2">is smaller than</option>
                    )}
                    {formState.para !== 'rating' && (
                      <option value="3">is greater than</option>
                    )}
                    <option value="4">is equal to</option>
                  </select>
                </div>
              </div>

              <div className="form-group w-full">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="value"
                >
                  Value to give Alert
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  name="value"
                  onChange={handleChange}
                  value={formState.value}
                />
              </div>

              <div className="form-group">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="type"
                >
                  Alert Type
                </label>
                <div className="relative z-20 w-full rounded border border-stroke p-1.5 pr-8 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                  <div className="flex flex-wrap items-center"></div>
                  <span
                    className={`${formState.type === '0' ? 'bg-[#04b20c]' : formState.type === '1' ? 'bg-[#eab90f]' : 'bg-[#e13f32]'} m-1.5 flex items-center justify-center rounded border-[.5px] border-stroke py-1.5 px-2.5 text-white font-medium dark:border-strokedark`}
                  >
                    {formState.type === '0'
                      ? 'Info'
                      : formState.type === '1'
                        ? 'Warning'
                        : 'Alert'}
                  </span>
                  <select
                    className="absolute top-0 left-0 z-20 h-full w-full bg-transparent opacity-0"
                    name="type"
                    onChange={handleChange}
                    value={formState.type}
                  >
                    <option value="0">Info</option>
                    <option value="1">Warning</option>
                    <option value="2">Alert</option>
                  </select>
                </div>
              </div>
            </div>
            {errors.some((item) => item.startsWith('INVALID_ID')) && (
              <>
                <br />
                <div className="error">
                  {errors.find((item) => item.startsWith('INVALID_ID'))?.replace(
                    'INVALID_ID_',
                    '',
                  )}{' '}
                  is not a valid bond
                </div>
              </>
            )}
            {errors.some((item) => !item.startsWith('INVALID_ID')) && (
              <div className="error">
                Please input{' '}
                {errors
                  .filter((item) => !item.startsWith('INVALID_ID'))
                  .join(', ')}
              </div>
            )}

            <br />
            <button
              className="btn flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:shadow-1"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
