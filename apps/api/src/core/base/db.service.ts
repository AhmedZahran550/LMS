import {
  NotFoundException,
  NotImplementedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindOneOptions,
  ObjectLiteral,
} from "typeorm";
import {
  paginate,
  PaginateQuery,
  PaginateConfig,
  FilterOperator,
  Paginated,
} from "nestjs-paginate";
import { PaginatedResponse } from "@lms/shared-types";
export interface Page<T> extends Paginated<T> {}
export interface QueryConfig<T> extends PaginateConfig<T> {}
export interface QueryOptions<T = any> extends PaginateQuery {
  where?: FindOptionsWhere<T>;
  disableCache?: boolean;
}
export const defaultQueryConfig: QueryConfig<any> = {
  filterableColumns: {
    createdBy: [FilterOperator.EQ],
    courseType: [FilterOperator.EQ],
  },
  sortableColumns: ["createdAt"],
  maxLimit: 100,
  defaultLimit: 10,
  // defaultSortBy: [['createdAt', 'DESC']],
};

export abstract class DBService<T extends ObjectLiteral, D = T, U = D> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected repository: Repository<T>,
    protected queryConfig?: QueryConfig<T>,
  ) {
    this.queryConfig = {
      ...defaultQueryConfig,
      ...queryConfig,
    } as QueryConfig<T>;
  }
  /**
   * Fetch all records with pagination, sorting, and filtering support
   * @param query PaginateQuery object from the controller
   * @param configOverride Optional PaginateConfig override
   * @returns Promise<PaginatedResponse<T>> mapped to the standard response shape
   */
  async findAll(options: QueryOptions<T>): Promise<Page<T>> {
    if (this.queryConfig) {
      const result = await paginate(options, this.repository, {
        ...this.queryConfig,
        where: options?.where,
      });
      return result;
    }
    throw new NotImplementedException("paginateConfig must be configured");
  }

  /**
   * Find a specific entity using FindOneOptions
   * @param options FindOneOptions
   * @returns Promise<T>
   */
  async findOne(options: FindOneOptions<T>) {
    const entity = await this.repository.findOne(options);

    return entity;
  }

  /**
   * Find a specific entity by its ID
   * @param id The entity ID
   * @param options Optional FindOneOptions
   * @returns Promise<T>
   */
  async findById(
    id: string | number,
    options?: Omit<FindOneOptions<T>, "where">,
  ) {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });
    return entity;
  }

  async findByIdOrFail(
    id: string | number,
    options?: Omit<FindOneOptions<T>, "where">,
  ): Promise<T> {
    const entity = await this.repository.findOneOrFail({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });

    return entity;
  }

  async findOneOrFail(options: FindOneOptions<T>) {
    return await this.repository.findOneOrFail(options);
  }

  /**
   * Create a new entity
   * @param createDto The data to create the entity with
   * @param additionalData Optional deep partial data to merge (e.g. instructorId from token)
   * @returns Promise<T>
   */
  async create(createDto: D, additionalData?: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create({
      ...(createDto as unknown as DeepPartial<T>),
      ...additionalData,
    });
    return await this.repository.save(entity);
  }

  /**
   * Update an existing entity by ID
   * @param id The entity ID
   * @param updateDto The update data
   * @returns Promise<T>
   */
  async update(id: string | number, updateDto: U): Promise<T> {
    const entity = await this.findByIdOrFail(id);
    const updatedEntity = this.repository.merge(
      entity,
      updateDto as unknown as DeepPartial<T>,
    );
    return await this.repository.save(updatedEntity);
  }

  /**
   * Remove an entity by ID
   * @param id The entity ID
   */
  async remove(id: string | number): Promise<void> {
    const entity = await this.findByIdOrFail(id);
    await this.repository.remove(entity);
  }

  async softDelete(id: string | number): Promise<void> {
    const entity = await this.findByIdOrFail(id);
    await this.repository.softRemove(entity);
  }
}
