/**
 * Author      : Jefri Herdi Triyanto
 * Description : manajemen untuk models
 */

const { isArray, isObject } = require('./Helpers');

class Models {

    /**
   * @Autowired
   */
    typeorm = require('typeorm'); // only declare here ...

    /**
   *
   * @param {{}} where
   * @returns
   */
    #createWhereSelector(where) {
        return Object.keys(where)
            .reduce((simpan, key) => {
                return [...simpan, `${key}=:${key}`];
            }, [])
            .join(' AND ');
    }

    /**
   *
   * @param {{}} where
   * @returns
   */
    #createWhereLikeSelector(where) {
        return (
            Object.keys(where)
                .reduce((simpan, key) => {
                    return [
                        ...simpan,
                        where[key] === '*' ? false : `LOWER(${key}) LIKE :${key}`,
                    ];
                }, [])
                // eslint-disable-next-line id-length
                .filter((v) => {
                    return v;
                })
                .join(' OR ')
        );
    }

    /**
   *
   * @param {*} entity
   * @param {[]|{}} data
   */
    async inputFrom(entity, data) {
        const new_data = [];
        if (isArray(data)) {
            new_data.push(...data);
        } else if (isObject(data)) {
            new_data.push(data);
        } else {
            throw new Error('please use Array Or Object to insert data!!!');
        }
        try {
            return await this.typeorm
                .getConnection()
                .createQueryBuilder()
                .insert()
                .into(entity)
                .values(new_data)
                .execute();
        } catch (error) {
            return false
        }
    }

    /**
   *
   * @param {*} entity
   * @param {{}} where
   * @returns
   */
    async selectFrom(entity, where) {
        return await this.typeorm
            .getRepository(entity)
            .createQueryBuilder()
            .where(this.#createWhereSelector(where), where)
            .getMany();
    }

    /**
     * @param {*} entity
     * @param {{}} where
     * @returns
     */
    async isLogin(entity, where) {
        const result = await this.selectFrom(entity, where)
        if (result.length > 0) {
            return result[0]
        }
        return false
    }

    /**
   *
   * @param {*} entity
   * @param {{}} keywords
   * @param {number} shows
   * @param {number} pages
   * @param {boolean} desc
   */
    async paginationFrom(entity, keywords, shows, pages, desc = false) {
        const take = shows <= 0 ? 10 : shows;
        const page = parseInt(pages, 10) <= 0 ? 1 : parseInt(pages, 10);
        const skip = (page - 1) * take;
        const keyword =
            typeof keywords === 'object' && !Array.isArray(keywords) ?
                Object.keys(keywords).reduce((simpan, key) => {
                    return {
                        ...simpan,
                        [key]:
                            keywords[key] === '*' ?
                                '*' :
                                `%${String(keywords[key]).toLowerCase()}%`,
                    };
                }, {}) :
                {};
        const orderBy = desc ? 'DESC' : 'ASC';

        const totalData = (await this.selectFrom(entity, {})).length
        const data = await this.typeorm
            .getRepository(entity)
            .createQueryBuilder()
            .where(this.#createWhereLikeSelector(keyword), keyword)
            .orderBy('id', orderBy)
            .skip(skip)
            .take(take)
            .getMany();

        // return data
        const lastPage = Math.ceil(totalData / shows);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;
        return {
            data,
            totalData,
            lastPage,
            prevPage,
            currentPage: page,
            nextPage,
        };
    }

    /**
   *
   * @param {*} entity
   * @param {{}} selector
   * @param {{}} data
   * @returns
   */
    async updateFrom(entity, where, data) {
        return await this.typeorm
            .getConnection()
            .createQueryBuilder()
            .update(entity)
            .set(data)
            .where(this.#createWhereSelector(where), where)
            .execute();
    }

    /**
   *
   * @param {*} entity
   * @param {{}} where
   * @returns
   */
    async deleteFrom(entity, where) {
        if ((await this.selectFrom(entity, where)).length > 0) {
            return await this.typeorm
                .getConnection()
                .createQueryBuilder()
                .delete()
                .from(entity)
                .where(this.#createWhereSelector(where), where)
                .execute();
        }
        return false
    }

    /**
   *
   * @param {*} entity
   * @param {{}} where
   * @returns
   */
    async softDeleteFrom(entity, where) {
        where.is_deleted = false
        if ((await this.selectFrom(entity, where)).length > 0) {
            return await this.updateFrom(entity, where, {
                is_deleted: true,
                deleted_date: new Date(),
            });
        }
        return false
    }
}

module.exports = Models;
