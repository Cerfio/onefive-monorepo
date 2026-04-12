// Transformer list en grid
export const CardLanguage = () => (
  <div className="flex border border-gray-200 drop-shadow-sm flex-col bg-white rounded-xl gap-4">
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 justify-between px-20 py-6">
      <div className="flex flex-col items-center">
        <div>Français</div>
        <div>Bilingue ou langue natale</div>
      </div>
      <div className="flex flex-col items-center">
        <div>Anglais</div>
        <div>Bilingue ou langue natale</div>
      </div>
      <div className="flex flex-col items-center">
        <div>Espagnol</div>
        <div>Notion</div>
      </div>
    </div>
  </div>
);
