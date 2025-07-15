import { Building } from 'lucide-react';
import { showToast } from '@/utils';

interface ProductionCompaniesProps {
  productionCompanies: string[];
}

const ProductionCompanies: React.FC<ProductionCompaniesProps> = ({
  productionCompanies,
}) => {
  if (!productionCompanies) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <Building className="w-5 h-5 mr-2" />
        Production Companies
      </h3>
      <div className="flex flex-wrap gap-2">
        {productionCompanies.map((company, index) => (
          <span
            key={index}
            onClick={() => {
              navigator.clipboard.writeText(`${company}`);
              showToast();
            }}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:cursor-pointer"
          >
            {company}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductionCompanies;
