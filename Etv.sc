Etv {

	classvar <>address;


	*boot{
		Server.default = Server.internal.boot;
		address = NetAddr("127.0.0.1",8000);
	}


	*grainX {
		| db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		Etv.address.sendMsg("/all","tanya","playGrainsSample",db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);

	}


	*grainY {
		| db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		Etv.address.sendMsg("/all","tanya","playGrainsTwo",db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);

	}

	*grainZ {
		| db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		Etv.address.sendMsg("/all","tanya","playGrainsThree",db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);

	}


	*callHim {
		| db=(-25), dur=30, rate=1, start=0 |
		Etv.address.sendMsg("/all","tanya","callHim",db,dur,rate,start);
	}


	*tdefX {
		| name=\x, wait=1, db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		^Tdef(name, {
			inf.do {(
				loop ({

					Etv.grainX(db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);
					1.wait;
				})
			)};
		})}


	*tdefY {
		| name=\y, wait=1, db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		^Tdef(name, {
			inf.do {(
				loop ({

					Etv.grainY(db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);
					1.wait;
				})
			)};
		})}



	*tdefZ {
		| name=\z, wait=1, db=(-100), dur=0.005, rate=1, rmod=0, start=0, smod=0, grainNum=1, nmod=0, grainPeriod=1000, gmod=0 |

		^Tdef(name, {
			inf.do {(
				loop ({

					Etv.grainZ(db,dur,rate,rmod,start,smod,grainNum,nmod,grainPeriod,gmod);
					1.wait;
				})
			)};
		})}

}