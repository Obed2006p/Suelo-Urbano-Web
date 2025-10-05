
import React, { useState } from 'react';
import { CheckCircleIcon, CaretUpIcon, CaretDownIcon } from './icons/Icons';
import Footer from './Footer';

// El Header ahora se pasa como prop para que App.tsx pueda controlarlo
interface OrderPageProps {
  header: React.ReactNode;
}

// Declara la variable global de emailjs para que TypeScript la reconozca.
declare const emailjs: any;

const OrderPage: React.FC<OrderPageProps> = ({ header }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: 'Bolsa de 300gr',
    quantity: 1,
    street: '',
    extNumber: '',
    intNumber: '',
    neighborhood: '',
    postalCode: '',
    references: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleQuantityChange = (amount: number) => {
    setFormData(prev => {
        const currentQuantity = Number(prev.quantity) || 0;
        const newQuantity = Math.max(1, currentQuantity + amount);
        return { ...prev, quantity: newQuantity };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const serviceID = 'service_metl5hg';
    const templateID = 'template_dcsxv2c';
    const publicKey = 'mvC0PNypKE5HwcSc-';

    const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'No proporcionado',
        size: formData.size,
        quantity: Number(formData.quantity) || 1,
        street: formData.street || 'No proporcionado',
        extNumber: formData.extNumber || 'No proporcionado',
        intNumber: formData.intNumber || 'N/A',
        neighborhood: formData.neighborhood || 'No proporcionado',
        postalCode: formData.postalCode || 'No proporcionado',
        references: formData.references || 'No proporcionado'
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response: any) => {
        console.log('SUCCESS!', response.status, response.text);
        setIsLoading(false);
        setIsSubmitted(true);
      }, (err: any) => {
        console.error('FAILED...', err);
        setIsLoading(false);
        setError('Hubo un error al enviar el pedido. Por favor, inténtalo de nuevo más tarde.');
      });
  };
  
  const resetForm = () => {
    setIsSubmitted(false);
    setError(null);
    setFormData({
        name: '',
        email: '',
        phone: '',
        size: 'Bolsa de 300gr',
        quantity: 1,
        street: '',
        extNumber: '',
        intNumber: '',
        neighborhood: '',
        postalCode: '',
        references: '',
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow py-16 md:py-24">
        {isSubmitted ? (
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">¡Pedido Recibido!</h2>
            <p className="text-stone-600 text-lg mb-8 dark:text-stone-300">
              Gracias por tu pedido, {formData.name}. Nos pondremos en contacto contigo muy pronto a través de tu correo {formData.email} para confirmar los detalles.
            </p>
            <button
              onClick={resetForm}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-colors duration-300"
            >
              Hacer Otro Pedido
            </button>
          </div>
        ) : (
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Realiza tu Pedido</h2>
              <p className="max-w-2xl mx-auto text-stone-600 dark:text-stone-300">
                Es fácil y rápido. Llena el formulario y nos pondremos en contacto para coordinar la entrega.
              </p>
            </div>
            <div id="order-form-container" className="max-w-2xl mx-auto bg-stone-50 p-8 rounded-2xl shadow-lg border border-stone-200 dark:bg-stone-800 dark:border-stone-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Error al enviar</p>
                    <p>{error}</p>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-stone-800 pb-2 border-b border-stone-200 dark:text-stone-200 dark:border-stone-600">Datos de Contacto</h3>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Nombre Completo</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Correo Electrónico</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Teléfono (Opcional)</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"/>
                </div>

                <h3 className="text-lg font-semibold text-stone-800 pt-4 border-t border-stone-200 dark:text-stone-200 dark:border-stone-600">Detalles del Pedido</h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <label htmlFor="size" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Presentación del Producto</label>
                    <select name="size" id="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:text-white">
                      <option value="Bolsa de 300gr">Bolsa de 300gr</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Cantidad</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            name="quantity" 
                            id="quantity" 
                            min="1" 
                            required 
                            value={formData.quantity} 
                            onChange={handleChange} 
                            className="w-full pl-4 pr-10 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 text-center dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center p-1">
                            <div className="flex flex-col h-full w-7 bg-green-200 rounded-md overflow-hidden shadow-sm dark:bg-stone-600">
                                <button 
                                    type="button" 
                                    tabIndex={-1}
                                    onClick={() => handleQuantityChange(1)}
                                    className="flex-1 w-full flex items-center justify-center text-green-800 hover:bg-green-300 transition-colors focus:outline-none dark:text-green-300 dark:hover:bg-stone-500"
                                    aria-label="Aumentar cantidad"
                                >
                                    <CaretUpIcon className="h-4 w-4" />
                                </button>
                                <div className="w-full h-px bg-green-400/50 dark:bg-stone-500"></div>
                                <button 
                                    type="button" 
                                    tabIndex={-1}
                                    onClick={() => handleQuantityChange(-1)}
                                    className="flex-1 w-full flex items-center justify-center text-green-800 hover:bg-green-300 transition-colors focus:outline-none dark:text-green-300 dark:hover:bg-stone-500"
                                    aria-label="Disminuir cantidad"
                                >
                                    <CaretDownIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-stone-800 pt-4 border-t border-stone-200 dark:text-stone-200 dark:border-stone-600">Dirección de Entrega</h3>
                <p className="text-sm text-stone-500 -mt-4 dark:text-stone-400">Llena estos campos si deseas que te entreguemos el pedido a domicilio.</p>
                
                <div>
                    <label htmlFor="street" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Calle</label>
                    <input type="text" name="street" id="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                </div>
                 <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label htmlFor="extNumber" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Número Exterior</label>
                        <input type="text" name="extNumber" id="extNumber" value={formData.extNumber} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="intNumber" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Número Interior (Opcional)</label>
                        <input type="text" name="intNumber" id="intNumber" value={formData.intNumber} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Colonia / Delegación</label>
                    <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Código Postal</label>
                    <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="references" className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-300">Referencias Adicionales</label>
                    <input type="text" name="references" id="references" value={formData.references} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white" />
                </div>
                
                <div className="pt-4">
                  <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Pedido'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderPage;