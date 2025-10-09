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
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsNotIn,
  IsNotEmpty,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { PricingType } from '../entities/listing.entity';
import { Transform, Type } from 'class-transformer';
export enum ApartmentSpaceType {
  GUEST_HOUSE = 'guest house',
  SHORT_TERM_LEASE = 'short term lease',
  LONG_TERM_LEASE = 'long term lease',
}

export enum HouseSpaceType {
  LAND_CERTIFICATE = 'land certificate',
  SALES_AGREEMENT = 'sales agreement',
  OTHER = 'other',
}

export enum CommercialSpaceType {
  SHOP = 'shop',
  OFFICE = 'office',
  WAREHOUSE = 'warehouse',
  HOTEL = 'hotel',
}

export enum LandOwnershipType {
  SHOP = 'shop',
  OFFICE = 'office',
  WAREHOUSE = 'warehouse',
  HOTEL = 'hotel',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  LAND = 'land',
  COMMERCIAL = 'commercial',
}
// Enum for valid features
export enum ValidFeatures {
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

// Enum for GeoJSON Point type
export enum GeoJsonType {
  POINT = 'Point',
}

// Custom validator for location
@ValidatorConstraint({ name: 'locationValidator', async: false })
class LocationValidator implements ValidatorConstraintInterface {
  validate(location: any, args: ValidationArguments) {
    console.log('LocationValidator: input', location);

    // Check if location is a non-null object and not an array
    if (!location || typeof location !== 'object' || Array.isArray(location)) {
      console.log('LocationValidator: not a valid object', location);
      return false;
    }

    // Check for required properties
    if (
      !Object.prototype.hasOwnProperty.call(location, 'type') ||
      location.type == null
    ) {
      console.log('LocationValidator: type is missing or null', location.type);
      return false;
    }

    if (
      !Object.prototype.hasOwnProperty.call(location, 'coordinates') ||
      location.coordinates == null
    ) {
      console.log(
        'LocationValidator: coordinates is missing or null',
        location.coordinates,
      );
      return false;
    }

    // Validate type
    const isValidType = location.type === GeoJsonType.POINT;
    if (!isValidType) {
      console.log('LocationValidator: type is not "Point"', location.type);
      return false;
    }

    // Validate coordinates
    const isValidCoordinates =
      Array.isArray(location.coordinates) && location.coordinates.length === 2;
    if (!isValidCoordinates) {
      console.log(
        'LocationValidator: coordinates is not a valid array of length 2',
        location.coordinates,
      );
      return false;
    }

    const [latitude, longitude] = location.coordinates; // Input as [lat, long]
    const isValidLatitude =
      typeof latitude === 'number' && latitude >= -90 && latitude <= 90;
    const isValidLongitude =
      typeof longitude === 'number' && longitude >= -180 && longitude <= 180;

    if (!isValidLatitude) {
      console.log('LocationValidator: invalid latitude', latitude);
    }
    if (!isValidLongitude) {
      console.log('LocationValidator: invalid longitude', longitude);
    }

    return (
      isValidType && isValidCoordinates && isValidLatitude && isValidLongitude
    );
  }

  defaultMessage() {
    return 'location must be an object with { type: "Point", coordinates: [latitude, longitude] } where latitude is between -90 and 90, and longitude is between -180 and 180 (e.g., { type: "Point", coordinates: [33.6789, 73.1234] })';
  }
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
    } else if (propertyType.toLocaleLowerCase() === 'commercial') {
      return Object.values(CommercialSpaceType).includes(
        spaceType as CommercialSpaceType,
      );
    } else {
      return !spaceType;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType.toLocaleLowerCase() === 'apartment') {
      return `spaceType must be one of: ${Object.values(ApartmentSpaceType).join(', ')} for ${propertyType}`;
    } else if (propertyType.toLocaleLowerCase() === 'house') {
      return `spaceType must be one of: ${Object.values(HouseSpaceType).join(', ')} for ${propertyType}`;
    } else if (propertyType.toLocaleLowerCase() === 'commercial') {
      return `spaceType must be one of: ${Object.values(CommercialSpaceType).join(', ')} for ${propertyType}`;
    } else if (propertyType.toLocaleLowerCase() === 'land') {
      return `spaceType must not be passed if propertyType is land.`;
    }
    return 'Invalid spaceType';
  }
}

// Custom validator for ownershipType
@ValidatorConstraint({ name: 'ownershipTypeValidator', async: false })
class OwnershipTypeValidator implements ValidatorConstraintInterface {
  validate(ownershipType: string, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType.toLocaleLowerCase() === 'land') {
      return Object.values(LandOwnershipType).includes(
        ownershipType as LandOwnershipType,
      );
    } else if (propertyType.toLocaleLowerCase() !== 'land') {
      return !ownershipType;
    }

    // If propertyType is neither 'apartment' nor 'house', no validation is applied
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType.toLocaleLowerCase() === 'land') {
      return `ownershipType must be one of: ${Object.values(LandOwnershipType).join(', ')}`;
    } else if (propertyType.toLocaleLowerCase() === 'house') {
      return `ownershipType must not be passed when propertyType is house`;
    } else if (propertyType.toLocaleLowerCase() === 'apartment') {
      return `ownershipType must not be passed when propertyType is apartment`;
    } else if (propertyType.toLocaleLowerCase() === 'commercial') {
      return `ownershipType must not be passed when propertyType is commercial`;
    }
    return 'Invalid ownershipType';
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
      return 'titleInHand must be a boolean when propertyType is land';
    }
    return 'titleInHand must not be passed when propertyType is not land';
  }
}
// Custom validator for features
@ValidatorConstraint({ name: 'featuresValidator', async: false })
class FeaturesValidator implements ValidatorConstraintInterface {
  validate(amenities: string[] | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType === PropertyType.LAND) {
      // When propertyType is 'land', features must be an empty array or undefined
      return (
        amenities === undefined ||
        (Array.isArray(amenities) && amenities.length === 0)
      );
    } else {
      // For other propertyTypes, features must be an array of valid values
      if (!Array.isArray(amenities)) {
        return false;
      }
      // Check if every feature is in the ValidFeatures enum
      return amenities.every((feature) =>
        Object.values(ValidFeatures).includes(feature as ValidFeatures),
      );
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType === PropertyType.LAND) {
      return 'features must not be passed when propertyType is land';
    }
    return `features must be an array containing only: ${Object.values(ValidFeatures).join(', ')}`;
  }
}
// Custom validator for pricing-related fields (monthlyRent and salePrice)
@ValidatorConstraint({ name: 'pricingValidator', async: false })
class PricingValidator implements ValidatorConstraintInterface {
  validate(value: number | undefined, args: ValidationArguments) {
    const { pricing, monthlyRent, salePrice } = args.object as CreateListingDto;

    if (pricing === PricingType.FOR_RENT) {
      // For 'for rent', monthlyRent must be a number >= 0, salePrice must be undefined, null, or 0
      return (
        typeof monthlyRent === 'number' &&
        monthlyRent >= 0 &&
        (salePrice === undefined || salePrice === null || salePrice === 0)
      );
    } else if (pricing === PricingType.FOR_SALE) {
      // For 'for sale', salePrice must be a number >= 0, monthlyRent must be undefined, null, or 0
      return (
        typeof salePrice === 'number' &&
        salePrice >= 0 &&
        (monthlyRent === undefined || monthlyRent === null || monthlyRent === 0)
      );
    }

    // Should not reach here due to IsEnum(PricingType) on pricing
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const { pricing } = args.object as CreateListingDto;
    if (pricing === PricingType.FOR_RENT) {
      return 'monthlyRent must be a number >= 0 and salePrice must not be passed when pricing is for rent';
    } else if (pricing === PricingType.FOR_SALE) {
      return 'salePrice must be a number >= 0 and monthlyRent must not be passed when pricing is for sale';
    }
    return 'Invalid pricing configuration';
  }
}

// Custom validator for bedrooms and bathrooms
@ValidatorConstraint({ name: 'bedroomsBathroomsValidator', async: false })
class BedroomsBathroomsValidator implements ValidatorConstraintInterface {
  validate(value: number | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (
      propertyType === PropertyType.APARTMENT ||
      propertyType === PropertyType.HOUSE
    ) {
      return typeof value === 'number' && value >= 1;
    } else if (
      propertyType === PropertyType.COMMERCIAL ||
      propertyType === PropertyType.LAND
    ) {
      return value === undefined || value === null;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (
      propertyType === PropertyType.APARTMENT ||
      propertyType === PropertyType.HOUSE
    ) {
      return `${args.property} must be a number >= 1 when propertyType is ${propertyType}`;
    } else if (
      propertyType === PropertyType.COMMERCIAL ||
      propertyType === PropertyType.LAND
    ) {
      return `${args.property} must not be passed when propertyType is ${propertyType}`;
    }
    return `Invalid ${args.property}`;
  }
}

// Custom validator for documentFile
@ValidatorConstraint({ name: 'documentFileValidator', async: false })
class DocumentFileValidator implements ValidatorConstraintInterface {
  validate(documentFile: string | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    // documentFile is optional, so undefined is always valid
    if (documentFile === undefined || documentFile === null) {
      return true;
    }

    // If documentFile is provided, it must be a string
    if (typeof documentFile !== 'string') {
      return false;
    }

    // documentFile is only allowed for house or land
    if (
      propertyType === PropertyType.HOUSE ||
      propertyType === PropertyType.LAND
    ) {
      return true;
    } else if (
      propertyType === PropertyType.APARTMENT ||
      propertyType === PropertyType.COMMERCIAL
    ) {
      return false;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (
      propertyType === PropertyType.APARTMENT ||
      propertyType === PropertyType.COMMERCIAL
    ) {
      return `documentFile must not be passed when propertyType is ${propertyType}`;
    }
    return 'documentFile must be a string when provided for propertyType house or land';
  }
}

// Custom validator for isFurnished
@ValidatorConstraint({ name: 'isFurnishedValidator', async: false })
class IsFurnishedValidator implements ValidatorConstraintInterface {
  validate(isFurnished: boolean | undefined, args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;

    if (propertyType === PropertyType.APARTMENT || propertyType === PropertyType.HOUSE || propertyType === PropertyType.COMMERCIAL) {
      return typeof isFurnished === 'boolean';
    } else if (propertyType === PropertyType.LAND) {
      return isFurnished === undefined || isFurnished === null;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const { propertyType } = args.object as CreateListingDto;
    if (propertyType === PropertyType.APARTMENT || propertyType === PropertyType.HOUSE || propertyType === PropertyType.COMMERCIAL) {
      return `isFurnished must be a boolean when propertyType is ${propertyType}`;
    } else if (propertyType === PropertyType.LAND) {
      return `isFurnished must not be passed when propertyType is land`;
    }
    return 'Invalid isFurnished';
  }
}

export class CreateListingDto {
  @IsString()
  propertyTitle: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNotEmpty({ message: 'location must not be empty' })
  @Validate(LocationValidator)
  @Transform(({ value }) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Array.isArray(value.coordinates) &&
      value.coordinates.length === 2 &&
      typeof value.coordinates[0] === 'number' &&
      typeof value.coordinates[1] === 'number'
    ) {
      console.log(
        'CreateListingDto Transform: transforming coordinates',
        value.coordinates,
      );
      return {
        ...value,
        coordinates: [value.coordinates[1], value.coordinates[0]], // Swap [lat, long] to [long, lat]
      };
    }
    console.log(
      'CreateListingDto Transform: invalid location, returning unchanged',
      value,
    );
    return value; // Return unchanged to allow validator to handle errors
  })
  location: { type: GeoJsonType; coordinates: [number, number] };

  @Validate(BedroomsBathroomsValidator)
  bedrooms?: number;

  @Validate(BedroomsBathroomsValidator)
  bathrooms?: number;

  @IsNumber()
  size: number;

  @IsEnum(PricingType)
  pricing: PricingType;

  @Validate(PricingValidator)
  monthlyRent?: number;

  @Validate(PricingValidator)
  salePrice?: number;

  @Validate(DocumentFileValidator)
  documentFile?: string;

  @IsNumber()
  @Min(100)
  findersFee: number;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @Validate(FeaturesValidator)
  amenities?: string[];

  @IsDateString()
  availableFrom: string;

  @IsOptional()
  isPromoted: boolean;

  @Validate(SpaceTypeValidator)
  spaceType?: string;

  @Validate(OwnershipTypeValidator)
  ownershipType?: string;

  @Validate(TitleInHandValidator)
  titleInHand?: boolean; // Optional boolean, validated conditionally

  @Validate(IsFurnishedValidator)
  isFurnished?: boolean;
}
