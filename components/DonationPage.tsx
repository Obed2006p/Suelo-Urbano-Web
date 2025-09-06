import React, { useState } from 'react';
import Footer from './Footer';
import { HeartIcon, BankIcon, ClipboardCopyIcon, ClipboardCheckIcon } from './icons/Icons';

interface DonationPageProps {
  header: React.ReactNode;
}

const DonationPage: React.FC<DonationPageProps> = ({ header }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bank: "BBVA Bancomer",
    beneficiary: "Obed Valencia",
    clabe: "012180015518498492",
    account: "155 184 9849",
    concept: "Donación Suelo Urbano"
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }, (err) => {
      console.error('Error al copiar: ', err);
      // You could add a user-facing error message here
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {header}
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <HeartIcon className="h-24 w-24 text-green-600 mx-auto mb-6 dark:text-green-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 dark:text-stone-100">Apoya Nuestra Misión</h2>
            <p className="text-stone-600 text-lg leading-relaxed dark:text-stone-300">
              Tu generosidad nos permite seguir transformando residuos orgánicos en vida para miles de plantas. Si deseas apoyarnos, puedes hacerlo a través de una transferencia bancaria.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 max-w-xl mx-auto border border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-4 border-b border-stone-200 dark:border-stone-600 pb-4 mb-6">
                <BankIcon className="h-10 w-10 text-green-700 dark:text-green-400 flex-shrink-0" />
                <div>
                    <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Datos para Donación</h3>
                    <p className="text-stone-500 dark:text-stone-400">Transferencia Bancaria</p>
                </div>
            </div>

            <div className="space-y-5">
              <DetailRow label="Banco" value={bankDetails.bank} />
              <DetailRow label="Titular" value={bankDetails.beneficiary} />
              <CopyableDetailRow label="CLABE Interbancaria" value={bankDetails.clabe} field="clabe" copiedField={copiedField} onCopy={handleCopy} />
              <CopyableDetailRow label="No. de Cuenta" value={bankDetails.account} field="account" copiedField={copiedField} onCopy={handleCopy} />
              <DetailRow label="Concepto (Sugerido)" value={bankDetails.concept} />
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-600 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                ¡Muchas gracias por tu apoyo! Si lo deseas, puedes enviarnos tu comprobante a nuestro correo para agradecerte personalmente.
              </p>
              <a href="mailto:contacto@suelourbano.com" className="text-green-700 dark:text-green-400 font-semibold hover:underline">contacto@suelourbano.com</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};


const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">{label}</p>
    <p className="text-lg font-semibold text-stone-800 dark:text-stone-200 break-words">{value}</p>
  </div>
);

const CopyableDetailRow: React.FC<{ label: string; value: string; field: string; copiedField: string | null; onCopy: (text: string, field: string) => void; }> = ({ label, value, field, copiedField, onCopy }) => {
    const isCopied = copiedField === field;
    return (
        <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">{label}</p>
            <div className="flex items-center justify-between gap-4 bg-stone-50 dark:bg-stone-700 p-3 rounded-lg">
                <p className="text-lg font-semibold text-stone-800 dark:text-stone-200 tracking-wider break-all">{value}</p>
                <button
                    onClick={() => onCopy(value, field)}
                    className={`flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-md transition-all duration-200 ${isCopied ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-600 dark:text-stone-200 dark:hover:bg-stone-500'}`}
                >
                    {isCopied ? <ClipboardCheckIcon className="h-4 w-4" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
        </div>
    );
};

export default DonationPage;