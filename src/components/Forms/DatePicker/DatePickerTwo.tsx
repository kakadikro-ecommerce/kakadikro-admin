const DatePickerTwo = () => {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        Date picker
      </label>
      <div className="relative">
        <input
          type="date"
          className="form-datepicker w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
        />
      </div>
    </div>
  );
};

export default DatePickerTwo;
