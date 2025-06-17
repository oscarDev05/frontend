import { useEffect, useRef } from "react";

const Confirmacion = ({ mensaje = "¿Está seguro de que desea eliminarlo?", onConfirm, onCancel }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 p-4 z-50">
      <div ref={modalRef} className="block bg-white rounded-2xl p-6 w-1/4 h-fit   max-lg:w-1/2 max-n480:w-4/5">
        <div className="flex justify-end">
          <img
            src="/resources/cerrar.png"
            alt="cerrar popup"
            className="w-4 cursor-pointer"
            onClick={onCancel}
          />
        </div>
        <div>
          <p>{mensaje}</p>
          <div className="flex justify-between mt-4">
            <button
              onClick={onConfirm}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Aceptar
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
