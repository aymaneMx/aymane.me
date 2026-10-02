<template>
  <Blogs :posts="posts" title="Blogs"/>
</template>


<script>
export default {
  async asyncData() {
    const { getPageTable } = require('@/utils/notion')
    const pageTable = await getPageTable("ceef6f1a895a46b2a0e4a87b41405547")
    const posts = pageTable.filter((page) => page.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return {posts}
  },
  head: {
    title: "AymaneMx's Blog",
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: "aymaneMx's blog about python, django, vuejs."
      }
    ]
  }
}
</script>
