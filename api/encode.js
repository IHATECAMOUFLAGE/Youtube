export default function handler(req, res) {
  const target = "https://redirector.googlevideo.com/videoplayback?expire=1775629322&ei=qp_VadGhDeur8uMP45SS0Qo&ip=80.187.123.1&id=o-AAikQq_LyC4Wx3GmR9VqY5rPzcZ09tUgARrzMy_drAlh&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=740&met=1775607722%2C&mh=Ce&mm=31%2C29&mn=sn-bvvbaxivnuxqqu5b-4g5l%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=1&pl=26&rms=au%2Cau&initcwndbps=2183750&bui=AUUZDGLG0LTHTP0KIwe7h6-m9ZZ03uYsYAehIZ91I3sne1HhGb66KPSBHpVcmBdITk-G_QlM8reY27-E&spc=jlWavZEaJH-jyZ9m1BaSJrA5rIs7QTJttma0OtR4gDvHxU0DeOGw&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=176404978&ratebypass=yes&dur=2438.582&lmt=1775151063609740&mt=1775607438&fvip=1&fexp=51565115%2C51565681&c=ANDROID_VR&txp=4538534&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AHEqNM4wRgIhAM3yaGqW2La0U8Zoq-M19APDRzGjHRURY0nrRxobZQE7AiEApanlGQRLCBsS_uuRjuGrUIslLBGYPlrsp5OZ4740Ztw%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRAIgaKEP9Lo-w4W0ledHw5pzXF3mRYCAaWsT_9DGLKjI1wwCIC-ipxy9VDC-u9eZNInARYEpanJNrrCKw7E277QjjFiZ&pot=MroIzGfhvOM1-tLMWV3Qn0vq-IH3wnPDrg1ODRewXs3Q6ttRzThf_LWOdHcx9sAVZYQpLPbj1C1n6okrGt3ZZQKMpN7Wh6fX9fzePc0TJ1pNirA4ZJVeVM9rtM9eAvWXeoEybDXy55hifYCSOLvII36D44sHdB6m-q0y79QKW9prbFIJuHyObRMtMKRHz1e2HCTny5Hy6vCWFD7lTqdfGRvyWQPo238iC0mRHFfX9pVF28aShcgjOrem9wtEZUYKYTQekDHo2XKyTnW80cHdJkt40tw0Hvd6GGd07sGBqxkzyqXHzUdaSw30huMlfQy-SigbIXvKwn54boe7S_1vtnNsSduDsKX9_fDM9Kbk6-YGgI9584hMNA9XhgEFSiDE40fQlorenmQ2hxSHOkJ54WhSGPribwBueyO8o4nOFcO_-yPyUQdW0s0EAUYAiytF4BxYtI7bV2K_G17bV2d3bUOtoV5AAMFXumLJqJFwjOvgjG1jXBqNk1BvX8TJ3sQfi2gnT9KCswfEOZKOC-PfHQAedYTj_xaYaCDQlmlAenRtgYx-d_tybrdt54z310kEG1MUTwqFovc7cmma6uQHls0jddvUC5fW8i8ctviAFpZSRXI296rkSKdpmOrADl6jedV1uanjq8shk_i1v7mqd0zv0hIbYgJQDnTuU2Ym0XxCEgVV-CNjBNAzppp85T3kgEybUB7r42tJ63u__NBl5bCgikjXgugbzy9ooZ5QAbUPqbsLDpI0nZwUN1fnuhtZjp8YYwM8pE4ejLZznTjK70oslzy5Oo_3BkNrtev1uvRbBFHjKrI4iSBQhLF0C6pzDOOyh-XURgpnVcc2sOfz-Ur2VTZQDQDzHwJjdQZPjrjRcX1gVVmJqDrIjtWmjHtYOvFWn7b9CA1K-J--vouFu1fclgNWxUwvnQ5k8R1dBeYJdd02chbrg7-REbbcSuEUlk3qyQjTFqk9IrLDZUtmehbGMR4lXrhHsUC9HEpAOilY3hYNI7c3PFfM7KyGgSte0lKnB_3pln8VbcCGLVpKBOuVa-uMcj8Xtw3EOfZ9EOCgpQAkewjG1RNPnYng9A8o2vvHeJn78JhOJIwjzbFZkn0TK619p3OpU7tVZzmxZLVHaYT5JWxPGYj3QXI3Cx2B06vVS9YtP-8h8hfFXv7z0w87SAes7E-Fu-YHNxOOHXWONz-iYLOJhs4Os9Z2jdrJkdl8gKQmiAUsLef0tdr3xK3DdIG8GQtRtutGKyAIOBtH-TJGoAv9LoUgb6CaUfPR6oJS50OQ3VZgNRJTkSap9LBmJmB_-UMzavqlv34Y2j5OsLMvl4AWoAdfoFB1VzDPksixgStCmEn4qOVH-s9ekcPnJlh7WYujikDSKwVtEmm9re9s4nrCXPmSt3j9A5md3WGAMrIWcEDGyKUIaYbOVazZAwrOfFquCfdtupo=";
  if (!target) {
    res.status(400).send("Missing url");
    return;
  }

  const encoded = encodeURIComponent(target);

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
        <video controls autoplay style="width:100%;height:auto;max-height:100vh;">
          <source src="/api/stream?url=${encoded}" type="video/mp4">
        </video>
      </body>
    </html>
  `);
}
