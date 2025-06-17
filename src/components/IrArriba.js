const IrArriba = () => {
    return(
        <button className="fixed bottom-6 right-6 w-12 h-12 border-2 rounded-full shadow-md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img className="p-3" src="\resources\flecha_arriba.png"/>
        </button>
    );
};

export default IrArriba;