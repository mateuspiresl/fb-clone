## Entities

- User
  - name: `string`
  - birthdate: `string`
  - photo: `string`
  - username: `string`
  - password: `string`

- Friendship
  - userA: `User`
  - userB: `User`

- FriendshipRequest
  - requester: `User`
  - requested: `User`

- UserBlocking
  - blocker: `User`
  - blocked: `User`

- Post
  - user: `User`
  - content: `string` | `null`
  - photo: `string` | `null`
  - isPublic: `boolean`

- FeedPost
  - user: `User`
  - post: `Post`

- GroupPost
  - group: `User`
  - post: `Post`

- Comment
  - user: `User`
  - post: `Post`
  - content: `string`

- CommentAnswer
  - user: `User`
  - comment: `Comment`
  - content: `string`

- Group
  - name: `string`
  - description: `string`
  - creator: `User`

- GroupMembership
  - user: `User`
  - group: `Group`
  - isAdmin: `boolean`

- GroupBlocking
  - user: `User`
  - group: `Group`

- GroupMembershipRequest
  - user: `User`
  - group: `Group`


## Queries

> Os usuários mantêm um perfil com fotos, informações pessoais e amigos na rede
> social.


### Auth

Register

```sql
INSERT INTO `user` (`name`, `birthdate`, `photo`, `username`, `password`)
VALUES (?, ?, ?, ?, ?)
```

Login

```sql
SELECT `id` FROM `user` WHERE `username`=? AND `password`=?
```

### User

Get user

- `user`: user been searched
- `self`: user searching

```sql
SELECT `id`, `name`, `birthdate`, `photo` FROM `user` as u
LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id`
WHERE u.`id`={user} AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!={self})
```

Update user

```sql
UPDATE `user` SET
  `name`=IF({name} IS NULL, `name`, {name}),
  `birthdate`=IF({birthdate} IS NULL, `birthdate`, {birthdate}),
  `photo`=IF({photo} IS NULL, `photo`, {photo})
WHERE `id`={id}
```

List users

```sql
SELECT u.`id`, u.`name`, u.`birthdate`, u.`photo` FROM `user` as u
LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id`
WHERE u.`id`!=? AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!=?)
```

### Friendship

> Para duas pessoas se tornarem amigas na rede social, uma envia um pedido de
> amizade para a outra, cabendo a segunda aceitar ou rejeitar o pedido.

Request friendship

```sql
INSERT INTO `user_friendship_request` (`requester_id`, `requested_id`)
VALUES (?, ?)
```

Create friendship request

```sql
INSERT INTO `user_friendship_request` (`requester_id`, `requested_id`)
SELECT {selfId}, {requestedId} FROM dual
WHERE NOT EXISTS (
  SELECT * FROM `user_friendship_request`
  WHERE `requester_id`={requestedId} AND `requested_id`={selfId}
)
```

Get friendship requests (users)

```sql
SELECT u.`id`, u.`name`, u.`photo` FROM `user_friendship_request` as r
RIGHT JOIN `user` as u ON u.`id`=r.`requester_id`
WHERE `requested_id`={requestedId}
```

Accept friendship request

```sql
@remove_friendship_request

INSERT INTO `user_friendship` (`user_a_id`, `user_b_id`)
SELECT {user_a_id}, {user_b_id} FROM dual
WHERE NOT EXISTS (
  SELECT * FROM `user_friendship`
  WHERE `user_a_id`={user_b_id} AND `user_b_id`={user_a_id}
)
```

Decline friendship request

```sql
DELETE FROM `user_friendship_request`
WHERE (?, ?)
```

Block user

- `@blocker`: user who blocks
- `@blocked`: blocked user

```sql
DELETE FROM `user_friendship`
WHERE `user_a_id`=@blocker AND `user_b_id`=@blocked
OR `user_a_id`=@blocked AND `user_b_id`=@blocker

INSERT INTO `user_blocking` (`blocker_id`, `blocked_id`)
VALUES (@blocker, @blocked)
```

Unblock user

```sql
DELETE FROM `user_blocking`
WHERE `blocker_id`=@blocker AND `blocked_id`=@blocked
```

Get friends (IDs only)

```sql
SELECT * FROM (
  SELECT `user_a_id` as `id` FROM `user_friendship` WHERE `user_b_id`=@user_id
  UNION
  SELECT `user_b_id` as `id` FROM `user_friendship` WHERE `user_a_id`=@user_id
) f;
```

Get friends

```sql
SELECT u.`id`, u.`name`, u.`photo` FROM (
  SELECT `user_a_id` as `id` FROM `user_friendship` WHERE `user_b_id`=@user_id
  UNION
  SELECT `user_b_id` as `id` FROM `user_friendship` WHERE `user_a_id`=@user_id
) f INNER JOIN `user` AS u ON u.`id`=f.`id`;
```

Remove friend

```sql
DELETE FROM `user_friendship`
WHERE (`user_a_id`=@user_a_id AND `user_b_id`=@user_b_id)
  OR (`user_a_id`=@user_b_id AND `user_b_id`=@user_a_id);
```

### Group

Get group

- `group`: group been searched
- `self`: user searching

```sql
SELECT g.`id`, g.`name`, g.`description` FROM `group` as g
LEFT JOIN `group_blocking` as gb ON g.`id`=gb.`group_id`
WHERE g.`id`={group} AND gb.`user_id`!={self}
```

List users

```sql
SELECT g.`id`, g.`name`, g.`description` FROM `group` as g
LEFT JOIN `group_blocking` as gb ON g.`id`=gb.`group_id`
WHERE gb.`group_id` IS NULL OR gb.`user_id`!=?
```

### Post

Get posts on self's feed

```sql
SELECT `id`, `content`, `photo` FROM `post` as p
INNER JOIN `feed_post` as fp ON p.`id`=fp.`post_id`
WHERE fp.`user_id`=?
```

Get posts on some user's feed

```sql
SELECT `id`, `content`, `photo` FROM `post` as p
INNER JOIN `feed_post` as fp ON p.`id`=fp.`post_id`
WHERE fp.`user_id`=? AND p.`is_public`=1
```

Get posts on a group

```sql
SELECT `id`, `content`, `photo` FROM `post` as p
INNER JOIN `group_post` as fp ON p.`id`=fp.`post_id`
WHERE fp.`user_id`=? AND p.`is_public`=1
```

Create post for user feed

> Cada usuário possui um mural, onde pode postar textos e fotos, sendo possível
> também postar algo nos murais de outras pessoas.

- `author`: the user who wrote
- `content`: the content
- `photo`: the photo
- `is_public`: flag for publicity
- `user`: the user who received
  - Can be the same of author, if someone is posting in his own feed.

```sql
INSERT INTO `post` (`author_id`, `content`, `photo`, `is_public`)
VALUES ({author}, {content}, {photo}, {is_public})

INSERT INTO `feed_post` (`post_id`, `user_id`)
VALUES (LAST_INSERT_ID(), {user})
```

Create post for group feed

- `author`: the user who wrote
- `content`: the content
- `photo`: the photo
- `is_public`: flag for publicity
- `group`: the group that received

```sql
INSERT INTO `post` (`author_id`, `content`, `photo`, `is_public`)
VALUES ({author}, {content}, {photo}, {is_public})

INSERT INTO `group_post` (`post_id`, `group_id`)
VALUES (LAST_INSERT_ID(), {group})
```

Remove post

> O dono do mural pode apagar qualquer postagem, comentário e resposta a
> comentário.

```sql
DELETE FROM `post` WHERE `id`=? AND 
```

### Comment

O dono do mural pode apagar qualquer postagem, comentário e
resposta a comentário. Os usuários podem definir a visibilidade de cada informação postada no seu
mural: visibilidade pública ou para amigos apenas.

Comment post

> Cada postagem no mural pode ter comentários e cada comentário pode ter
> respostas a ele.

- `author`: the user who wrote
- `post`: the post that received the comment
- `content`: the content

```sql
INSERT INTO `comment` (`user_id`, `post_id`, `content`)
VALUES ({author}, {post}, {content})
```

Remove comment

> O dono do mural pode apagar qualquer postagem, comentário e resposta a
> comentário.

```sql
DELETE FROM `comment` WHERE `id`=?
```
