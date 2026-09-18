import { DigimonType, DigimonAttribute } from '../store/battleStore';
import TypeAttributeIcon from './TypeAttributeIcon';

const DigimonCardIdentity = ({
  name,
  level,
  type,
  attribute,
}: {
  name: string;
  level: number;
  type?: string;
  attribute?: string;
}) => (
  <div className="w-full min-w-0 text-center">
    <p
      className="font-heading text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 break-words"
      title={name}
    >
      {name}
    </p>
    <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
      <span>Lv. {level}</span>
      {type && attribute && (
        <TypeAttributeIcon
          type={type as DigimonType}
          attribute={attribute as DigimonAttribute}
          size="sm"
        />
      )}
    </div>
  </div>
);

export default DigimonCardIdentity;
