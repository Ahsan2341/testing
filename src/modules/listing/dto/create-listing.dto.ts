import {
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsDateString,
  IsOptional,
  ValidatorConstraint,
  Validate,
  ValidationArguments,
  ValidatorConstraintInterface,
  IsEnum,
} from 'class-validator';
enum ApartmentSpaceType {
  GUEST_HOUSE = 'guest house',
  SHORT_TERM_LEASE = 'short term lease',
  LONG_TERM_LEASE = 'long term lease',
}

enum HouseSpaceType {
  LAND_CERTIFICATE = 'land certificate',
  SALES_AGREEMENT = 'sales agreement',
  OTHER = 'other',
}

enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  LAND = 'land',
  COMMERCIAL = 'commercial',
}
// Enum for valid features
enum ValidFeatures {
  WIFI = 'wifi',
  CABLE_TV = 'cable tv',
  PARKING = 'parking',
  COVERED_PARKING = 'covered parking',
  HEATING = 'heating',
  HOT_WATER = 'hot water',
  ELEVATOR = 'elevator',
  WARDROBES = 'wardrobes',
  STANDBY_GENERATOR = 'standby generator',
}
// Custom validator for spaceType
@ValidatorConstraint({ name: 'spaceTypeValidator', async: false })
class SpaceTypeValidator implements ValidatorConstraintInterface {
  validate(spaceType: string, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType.toLocaleLowerCase() === 'apartment') {
      return Object.values(ApartmentSpaceType).includes(
        spaceType as ApartmentSpaceType,
      );
    } else if (propertyType.toLocaleLowerCase() === 'house') {
      return Object.values(HouseSpaceType).includes(
        spaceType as HouseSpaceType,
      );
    }

    // If propertyType is neither 'apartment' nor 'house', no validation is applied
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType.toLocaleLowerCase() === 'apartment') {
      return `spaceType must be one of: ${Object.values(ApartmentSpaceType).join(', ')}`;
    } else if (propertyType.toLocaleLowerCase() === 'house') {
      return `spaceType must be one of: ${Object.values(HouseSpaceType).join(', ')}`;
    }
    return 'Invalid spaceType';
  }
}
@ValidatorConstraint({ name: 'titleInHandValidator', async: false })
class TitleInHandValidator implements ValidatorConstraintInterface {
  validate(titleInHand: boolean | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType === 'land') {
      // When propertyType is 'plot', titleInHand must be a boolean (true or false)
      return typeof titleInHand === 'boolean';
    } else {
      // For other propertyTypes, titleInHand must be undefined or null
      return titleInHand === undefined || titleInHand === null;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType === 'land') {
      return 'titleInHand must be a boolean when propertyType is plot';
    }
    return 'titleInHand must be undefined or null when propertyType is not plot';
  }
}
// Custom validator for features
@ValidatorConstraint({ name: 'featuresValidator', async: false })
class FeaturesValidator implements ValidatorConstraintInterface {
  validate(amenities: string[] | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType === PropertyType.LAND) {
      // When propertyType is 'land', features must be an empty array or undefined
      return amenities === undefined || (Array.isArray(amenities) && amenities.length === 0);
    } else {
      // For other propertyTypes, features must be an array of valid values
      if (!Array.isArray(amenities)) {
        return false;
      }
      // Check if every feature is in the ValidFeatures enum
      return amenities.every((feature) => Object.values(ValidFeatures).includes(feature as ValidFeatures));
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType === PropertyType.LAND) {
      return 'features must be an empty array or undefined when propertyType is land';
    }
    return `features must be an array containing only: ${Object.values(ValidFeatures).join(', ')}`;
  }
}
export class CreateListingDto {
  @IsString()
  propertyTitle: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsString()
  address: string;

  @IsNumber()
  @Min(1)
  bedrooms: number;

  @IsNumber()
  @Min(1)
  bathrooms: number;

  @IsNumber()
  area: number;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @Validate(FeaturesValidator)
  amenities: string[];

  @IsDateString()
  availableFrom: string;

  @IsOptional()
  isPromoted: boolean;

  @IsString()
  @Validate(SpaceTypeValidator)
  spaceType: string;

  @Validate(TitleInHandValidator)
  titleInHand?: boolean; // Optional boolean, validated conditionally
}
