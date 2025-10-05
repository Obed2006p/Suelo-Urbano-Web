import React, { useState } from 'react';
import { CheckCircleIcon } from './icons/Icons';

// Declara la variable global de emailjs para que TypeScript la reconozca.
// El SDK se carga desde index.html
declare const emailjs: any;

const OrderSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: 'Bolsa de 200 gramos (Ideal para empezar)',
    quantity: 1,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Credenciales de EmailJS del usuario
    const serviceID = 'service_metl5hg';
    const templateID = 'template_dcsxv2c';
    const publicKey = 'mvC0PNypKE5HwcSc-';

    const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'No proporcionado',
        size: formData.size,
        quantity: formData.quantity
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

  if (isSubmitted) {
    return (
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">¡Pedido Recibido!</h2>
          <p className="text-stone-600 text-lg mb-8">
            Gracias por tu pedido, {formData.name}. Nos pondremos en contacto contigo muy pronto a través de tu correo {formData.email} para confirmar los detalles de la entrega.
          </p>
          <button
            onClick={() => {
                setIsSubmitted(false);
                setError(null);
                setFormData({name: '', email: '', phone: '', size: 'Bolsa de 200 gramos (Ideal para empezar)', quantity: 1});
            }}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            Hacer Otro Pedido
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Realiza tu Pedido</h2>
          <p className="max-w-2xl mx-auto text-stone-600">
            Es fácil y rápido. Llena el formulario y nos pondremos en contacto para coordinar la entrega.
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-stone-50 p-8 rounded-2xl shadow-lg border border-stone-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error al enviar</p>
                <p>{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Correo Electrónico</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">Teléfono (Opcional)</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label htmlFor="size" className="block text-sm font-medium text-stone-700 mb-1">Presentación del Producto</label>
                <select name="size" id="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition text-stone-800">
                  <option value="Bolsa de 200 gramos (Ideal para empezar)">Bolsa de 200g - Ideal para empezar</option>
                  <option value="Bolsa de 500 gramos (La más popular)">Bolsa de 500g - La más popular</option>
                  <option value="Bolsa de 1 kilogramo (Mejor valor)">Bolsa de 1kg - Mejor valor</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-1">Cantidad</label>
                <input type="number" name="quantity" id="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 bg-green-50 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition placeholder-stone-400 text-stone-800"/>
              </div>
            </div>
            <div>
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
    </section>
  );
};

export default OrderSection;