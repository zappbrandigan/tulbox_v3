import React from 'react';
import {
  Calendar,
  Languages,
  Globe,
  Star,
  ExternalLink,
  Users,
  User,
  Building,
} from 'lucide-react';
import { LoadingOverlay } from '@/components/ui';
import { AKATitle, IMDBProduction, productionType } from '@/types';
import { showToast } from '@/utils';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {getTypeIcon(selectedProduction.type)}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}
              >
                {selectedProduction.type}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {selectedProduction.title}
            </h2>
            <div className="flex items-center space-x-4 text-blue-100">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedProduction.releaseYear}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Languages className="w-4 h-4" />
                <span>{selectedProduction.language}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{selectedProduction.originCountry}</span>
              </div>
              {selectedProduction.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{selectedProduction.rating}/10</span>
                </div>
              )}
            </div>
          </div>
          {selectedProduction.poster && (
            <img
              src={selectedProduction.poster}
              alt={selectedProduction.title}
              className="w-24 h-36 object-cover rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* IMDB Code */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div
            onClick={() => {
              navigator.clipboard.writeText(
                `${selectedProduction.imdbCode.substring(1)}`
              );
              showToast();
            }}
            className="flex items-center space-x-2"
          >
            <span className="font-medium text-gray-900">IMDB Code:</span>
            <code className="px-2 py-1 bg-gray-200 rounded text-sm font-mono hover:cursor-pointer">
              {selectedProduction.imdbCode}
            </code>
          </div>
          <a
            href={`https://www.imdb.com/title/${selectedProduction.imdbCode}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            View on IMDB
            <ExternalLink className="inline w-5 h-5 text-gray-600" />
          </a>
        </div>

        {/* Plot */}
        {selectedProduction.plot && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Plot</h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedProduction.plot.length > 500
                ? `${selectedProduction.plot.substring(0, 500)}. . .`
                : selectedProduction.plot}
            </p>
          </div>
        )}

        {/* Cast & Crew */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Cast
            </h3>
            <div className="space-y-2">
              {selectedProduction.actors.map((actor, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigator.clipboard.writeText(`${actor}`);
                    showToast();
                  }}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:cursor-pointer"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{actor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Director */}
          {selectedProduction.director && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center hover:cursor-pointer">
                <User className="w-5 h-5 mr-2" />
                Director
              </h3>
              <div
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedProduction.director}`
                  );
                  showToast();
                }}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:cursor-pointer"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  {selectedProduction.director}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Production Companies */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Production Companies
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedProduction.productionCompanies.map((company, index) => (
              <span
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(`${company}`);
                  showToast();
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:cursor-pointer"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Loading AKAs */}
        {isLoadingAkas && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <LoadingOverlay message="Detecting AKA Languages..." />
          </div>
        )}

        {/* AKA Titles */}
        {akaTitles?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              International Titles
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Transliterated Title
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Article
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Language
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {akaTitles?.map((aka, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${aka.transliterated}\t${aka.article}\t${aka.type}\t${aka.language}`
                        );
                        showToast();
                      }}
                      className="hover:bg-gray-50 hover:cursor-pointer"
                    >
                      <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                        {aka.transliterated}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {aka.article}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {aka.language}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {aka.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDetails;
