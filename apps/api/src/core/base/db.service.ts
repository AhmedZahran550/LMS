import { NotFoundException, NotImplementedException, BadRequestException, Logger } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere, FindOneOptions, ObjectLiteral } from 'typeorm';
import { paginate, PaginateQuery, PaginateConfig } from 'nestjs-paginate';
import { PaginatedResponse } from '@lms/shared-types';

export abstract class DBService<T extends ObjectLiteral, D = T, U = D> {
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly queryConfig?: PaginateConfig<T>
  ) {}

  /**
   * Fetch all records with pagination, sorting, and filtering support
   * @param query PaginateQuery object from the controller
   * @param configOverride Optional PaginateConfig override
   * @returns Promise<PaginatedResponse<T>> mapped to the standard response shape
   */
  async findAll(query: PaginateQuery, configOverride?: Partial<PaginateConfig<T>>): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> {
    if (!this.queryConfig && !configOverride) {
      throw new NotImplementedException('PaginateConfig must be configured to use findAll');
    }

    const finalConfig = { ...this.queryConfig, ...configOverride } as PaginateConfig<T>;

    try {
      const paginatedResult = await paginate<T>(query, this.repository, finalConfig);
      
      return {
        data: paginatedResult.data,
        meta: {
          total: paginatedResult.meta.totalItems || 0,
          page: paginatedResult.meta.currentPage || 1,
          limit: paginatedResult.meta.itemsPerPage || 10,
          totalPages: paginatedResult.meta.totalPages || 1,
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error in findAll: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in findAll: ${String(error)}`);
      }
      throw new BadRequestException('Invalid query parameters');
    }
  }

  /**
   * Find a specific entity using FindOneOptions
   * @param options FindOneOptions
   * @returns Promise<T>
   */
  async findOne(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  /**
   * Find a specific entity by its ID
   * @param id The entity ID
   * @param options Optional FindOneOptions
   * @returns Promise<T>
   */
  async findById(id: string | number, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options
    });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Create a new entity
   * @param createDto The data to create the entity with
   * @param additionalData Optional deep partial data to merge (e.g. instructorId from token)
   * @returns Promise<T>
   */
  async create(createDto: D, additionalData?: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create({
        ...createDto as unknown as DeepPartial<T>,
        ...additionalData,
      });
      return await this.repository.save(entity);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error in create: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in create: ${String(error)}`);
      }
      throw new BadRequestException('Failed to create entity');
    }
  }

  /**
   * Update an existing entity by ID
   * @param id The entity ID
   * @param updateDto The update data
   * @returns Promise<T>
   */
  async update(id: string | number, updateDto: U): Promise<T> {
    try {
      const entity = await this.findById(id);
      const updatedEntity = this.repository.merge(entity, updateDto as unknown as DeepPartial<T>);
      return await this.repository.save(updatedEntity);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      if (error instanceof Error) {
        this.logger.error(`Error in update: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in update: ${String(error)}`);
      }
      throw new BadRequestException('Failed to update entity');
    }
  }

  /**
   * Remove an entity by ID
   * @param id The entity ID
   */
  async remove(id: string | number): Promise<void> {
    const entity = await this.findById(id);
    await this.repository.remove(entity);
  }
}
