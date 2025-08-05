import { Building, Copy } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ProductionCompaniesProps {
  productionCompanies: string[];
}

const ProductionCompanies: React.FC<ProductionCompaniesProps> = ({
  productionCompanies,
}) => {
  const { showToast } = useToast();
  if (!productionCompanies) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <Building className="size-5 mr-2" />
        Production Companies
      </h3>
      <div className="flex flex-wrap gap-2">
        {productionCompanies.map((company, index) => (
          <div className="group">
            <span
              key={index}
              onClick={() => {
                navigator.clipboard.writeText(`${company}`);
                showToast();
              }}
              className="inline-flex items-center pr-2 pl-6 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:cursor-pointer"
            >
              {company}
              <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100 focus:ml-3">
                <Copy className="size-3" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionCompanies;
