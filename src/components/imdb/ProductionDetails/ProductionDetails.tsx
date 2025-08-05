import React from 'react';
import { AKATitle, IMDBProduction, productionType } from '@/types';
import ProductionHeader from './ProductionHeaders';
import IMDBCode from './IMDBCode';
import Plot from './Plot';
import Cast from './Cast';
import Director from './Director';
import ProductionCompanies from './ProductionCompanies';
import AkaTitlesTable from './AkaTitlesTable';
import { Panel } from '@/components/ui';

interface ProductionDetailsProps {
  selectedProduction: IMDBProduction;
  isLoadingAkas: boolean;
  akaTitles: AKATitle[];
  getTypeIcon: (type: productionType) => JSX.Element;
}

const ProductionDetails: React.FC<ProductionDetailsProps> = ({
  selectedProduction,
  isLoadingAkas,
  akaTitles,
  getTypeIcon,
}) => {
  return (
    <Panel className="p-0 overflow-hidden">
      <ProductionHeader
        selectedProduction={selectedProduction}
        getTypeIcon={getTypeIcon}
      />

      <div className="p-6 space-y-6">
        <IMDBCode imdbCode={selectedProduction.imdbCode} />
        <Plot plot={selectedProduction.plot} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Cast actors={selectedProduction.actors} />
          <Director director={selectedProduction.director} />
        </div>

        <ProductionCompanies
          productionCompanies={selectedProduction.productionCompanies}
        />

        <AkaTitlesTable akaTitles={akaTitles} isLoadingAkas={isLoadingAkas} />
      </div>
    </Panel>
  );
};

export default ProductionDetails;
