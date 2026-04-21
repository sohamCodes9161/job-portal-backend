class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; // mongoose query
    this.queryString = queryString; // req.query
  }

  // 🔍 Search
  search() {
    if (this.queryString.search) {
      const keyword = this.queryString.search;

      this.query = this.query.find({
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { company: { $regex: keyword, $options: "i" } },
        ],
      });
    }

    return this;
  }

  // 🎯 Filter
  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["search", "page", "limit", "sort"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 🔥 HANDLE ARRAY FILTERS (jobType, location)
    if (queryObj.jobType) {
      queryObj.jobType = { $in: queryObj.jobType.split(",") };
    }

    if (this.queryString.location) {
      const words = this.queryString.location.split(" ");

      this.query = this.query.find({
        location: {
          $in: words.map((word) => new RegExp(word, "i")),
        },
      });
    }

    // 🔥 REMOVE EMPTY VALUES
    Object.keys(queryObj).forEach((key) => {
      if (!queryObj[key]) delete queryObj[key];
    });

    this.query = this.query.find(queryObj);

    return this;
  }
  // 📄 Pagination
  pagination(resultPerPage = 10) {
    const currentPage = Number(this.queryString.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }

  // 🔃 Sorting
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort("-createdAt"); // latest first
    }

    return this;
  }
}

export default ApiFeatures;