import { Button } from '@/components/base/buttons/button';

export const CardSkill = () => (
  <div className="flex border border-gray-200 drop-shadow-sm flex-col bg-white rounded-xl gap-4">
    <div className="flex flex-col gap-4 p-6">
      Softskills
      <div className="flex flex-wrap lg:flex-row gap-3 md:gap-6 lg:h-9">
        <div>
          {/* <Button label="Créativité" size="small" color="secondary" /> */}
          <Button color="secondary" size="sm">
            Créativité
          </Button>
        </div>
        <div>
          {/* <Button label="" size="small" color="secondary" /> */}
          <Button color="secondary" size="sm">
            Coopération
          </Button>
        </div>
        <div>
          {/* <Button label="Curiosité" size="small" color="secondary" /> */}
          <Button color="secondary" size="sm">
            Créativité
          </Button>
        </div>
        <div>
          {/* <Button label="Négociation" size="small" color="secondary" /> */}
          <Button color="secondary" size="sm">
            Créativité
          </Button>
        </div>
        <div>
          {/* <Button label="Efficacité" size="small" color="secondary" /> */}
          <Button color="secondary" size="sm">
            Créativité
          </Button>
        </div>
      </div>
    </div>
  </div>
);
