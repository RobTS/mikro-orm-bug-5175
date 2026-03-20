import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { FullTextType, MikroORM, ScalarReference } from "@mikro-orm/postgresql";
import type { Ref } from "@mikro-orm/postgresql"

@Entity()
@Index({properties: ['id']})
export class Tag {
  @PrimaryKey({type: 'text'})
  id: string;

  @Property({type: 'text'})
  label: string;

  @Property({
    type: FullTextType,
    default: '',
    lazy: true,
    ref: true,
  })
  searchablePropertiesVector: Ref<string>;

  @Property({
    type: "datetime",
    length: 3,
    onCreate: () => new Date(),
  })
  creationDate: Date;

  @Property({
    type: "datetime",
    length: 3,
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  lastUpdated: Date;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    entities: [Tag],
    user: "postgres",
    password: "postgres",
    dbName: "test_5175",
    port:  5432,
    host: "localhost",
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  const generator = orm.schema;
  await generator.drop();
  await generator.create();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  const tag = new Tag();
  orm.em.assign(tag, {
    id: 'Test',
    label: 'Label',
  });
  tag.searchablePropertiesVector = new ScalarReference<string>();
  tag.searchablePropertiesVector.set('Test Label');

  await orm.em.persist(tag).flush();

  orm.em.clear();

  const sameTag = await orm.em.findOneOrFail(Tag, {id: tag.id});
  sameTag.label = 'NewLabel';
  await orm.em.persist(sameTag).flush();
});

